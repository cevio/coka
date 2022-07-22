import 'reflect-metadata';
import mitt from 'mitt';
import { Router } from './router';
import { Widget } from './component';
import { TCokaMode } from './types';
import { Container, interfaces } from 'inversify';
import { TComponent, isWidget } from './component';
import { TCokaRuntimeMode } from './types';
import { CokaServerProvider, CokaServerProviderContext } from './provider';
import { WidgetInstance } from './instance';
import type { IncomingHttpHeaders } from 'http';
import { 
  widgetRenderMetadataNameSpace, 
  ControllerMetadataNameSpace, 
  transformComponent, 
  TUseWidgetState, 
  MiddlewareMetadataNameSpace 
} from './decorators';
import { 
  createContext, 
  PropsWithChildren, 
  FunctionComponent, 
  createElement, 
  useEffect, 
  useMemo, 
  useState,
} from 'react';

const e = mitt();

export interface TRequest {
  hash: string,
  pathname: string,
  query: Record<string, string>,
  params: Record<string, string>,
  hostname: string,
  headers?: IncomingHttpHeaders, // headers from https. using ssr
}
export const container = new Container();
export const RequestContext = createContext<TRequest>(null);
export const RuntimeModeContext = createContext<TCokaRuntimeMode>('server');
export const redirect = (url: string) => e.emit('redirect', url);
export const replace = (url: string) => e.emit('replace', url);

export function createServer<T extends TCokaMode>(cokaMode?: interfaces.Newable<T>) {
  const mode = cokaMode ? new cokaMode() : null;
  let prefix: string = '/';
  const router = new Router({
    maxParamLength: +Infinity,
    caseSensitive: true,
    ignoreTrailingSlash: true,
  })

  const matchable = (url: string) => {
    const locate = new URL(url);
    return !!router.find(decodePrefix(locate.pathname));
  }

  const setUrlPrefix = (str: string) => {
    if (!str || !str.endsWith('/')) throw new Error('prefix must end with `/`');
    prefix = str;
  }

  const decodePrefix = (url: string) => {
    url = url.startsWith(prefix) ? url.substring(prefix.length) : url;
    return !url.startsWith('/') ? '/' + url : url;
  }

  const encodePrefix = (url: string) => {
    return prefix + (url.startsWith('/') ? url.substring(1) : url);
  }

  /**
   * 通用组件
   * 一般用于SSR渲染
   * @param props 
   * @returns 
   */
  const Application = (props: PropsWithChildren<{ href: string, headers?: IncomingHttpHeaders }>) => {
    const object = useMemo(() => {
      const url = new URL(props.href);
      const query: Record<string, string> = {};
      for (const [key, value] of url.searchParams.entries()) query[key] = value;
      const pathname = decodePrefix(url.pathname);
      const matched = router.find(pathname);
      const state: TRequest = {
        hash: url.hash,
        pathname,
        query: query,
        params: matched ? matched.params : {},
        hostname: url.hostname,
        headers: props.headers,
      }
      if (matched) {
        const widget: WidgetInstance = matched.handler();
        return {
          state, 
          next: widget.render(state),
        }
      } else {
        return {
          state,
          next: props.children
        }
      }
    }, [props.href, props.headers]);
    return createElement(RequestContext.Provider, { value: object.state }, object.next);
  }

  const Runtime = (props: PropsWithChildren<{ mode: TCokaRuntimeMode }>) => {
    const [href, setHref] = useState<string>(mode.getURL());
    useEffect(() => {
      if (mode) {
        const handler = () => setHref(mode.getURL());
        const _handler = () => e.emit('change');
        const feedback = mode.listen(_handler);
        e.on('change', handler);
        return () => {
          e.off('change', handler);
          feedback();
        }
      }
    }, []);
    return createElement(
      RuntimeModeContext.Provider, 
      { value: props.mode }, 
      createElement(Application, { href }, props.children)
    );
  }

  /**
   * Web端页面组件
   * @param props 
   * @returns 
   */
  const Browser = (props: PropsWithChildren<{}>) => createElement(Runtime, { mode: 'browser' }, props.children);

  /**
   * 服务端渲染的client端组件
   * @param props 
   * @returns 
   */
  const Client = (props: PropsWithChildren<{ state?: Record<string, { data: any, error?: string }> }>) => {
    if (props.state) {
      const value = props.state;
      for (const i in value) {
        if (!CokaServerProviderContext.has(i)) {
          CokaServerProviderContext.set(i, {
            isValidating: false,
            data: value[i].data,
            promise: null,
            fn: null,
            error: value[i].error,
          })
        }
      }
    }
    return createElement(
      CokaServerProvider.Provider, 
      { value: CokaServerProviderContext },
      createElement(Runtime, { mode: 'client' }, props.children)
    )
  };

  const middlewares: TUseWidgetState[] = [];
  const use = <P>(cmp: TComponent<P>, props?: P) => middlewares.push(transformComponent(cmp, props));

  const createMiddlewares = (widget: FunctionComponent<TRequest>, mds: TUseWidgetState[]) => {
    const _widget = new WidgetInstance(widget, mds);
    return () => _widget;
  }

  const createPathRule = (path: string, cmp: TComponent) => {
    const _middlewres = middlewares.slice(0);
    const isWidgetComponent = isWidget(cmp);
    if (isWidgetComponent && !Reflect.hasMetadata(widgetRenderMetadataNameSpace, cmp)) {
      throw new Error('target is not a IOC component');
    }
    let component: FunctionComponent = isWidgetComponent
      ? Reflect.getMetadata(widgetRenderMetadataNameSpace, cmp)
      : cmp as FunctionComponent;
    if (Reflect.hasMetadata(MiddlewareMetadataNameSpace, cmp)) {
      const component_middlewares: TUseWidgetState[] = Reflect.getMetadata(MiddlewareMetadataNameSpace, cmp);
      _middlewres.push(...component_middlewares);
    }
    router.on(path, createMiddlewares(component, _middlewres));
  }

  const createService = <P>(clazz: interfaces.Newable<Widget<P>>) => {
    if (!isWidget(clazz)) throw new Error('target is not a IOC component');
    if (!Reflect.hasMetadata(ControllerMetadataNameSpace, clazz)) {
      throw new Error('target miss @controller(...) annotation');
    }
    createPathRule(Reflect.getMetadata(ControllerMetadataNameSpace, clazz), clazz);
  }

  if (mode) {
    e.on('redirect', (url: string, title: string = window.document.title) => mode.redirect(encodePrefix(url), title, () => e.emit('change')));
    e.on('replace', (url: string, title: string = window.document.title) => mode?.replace(encodePrefix(url), title, () => e.emit('change')));
  }

  return {
    use,
    matchable,
    Browser,
    Client,
    Application,
    createPathRule,
    createService,
    setUrlPrefix,
  }
}