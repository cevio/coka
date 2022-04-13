import URL from 'url-parse';
import mitt from 'mitt';
import { Router } from './router';
import { Container, interfaces } from 'inversify';
import { TComponent, isWidget } from './component';
import { 
  widgetRenderMetadataNameSpace, 
  widgetControllerMetadataNameSpace, 
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
  useDeferredValue, 
  useEffect, 
  useMemo, 
  useState,
  FunctionComponentElement,
  PropsWithoutRef
} from 'react';
import { Widget } from '.';

export type THistoryMode = 'hashchange' | 'popstate';
export interface TRequest {
  hash: string,
  pathname: string,
  query: Record<string, string>,
  params: Record<string, string>,
}
export const container = new Container();
export const RequestContext = createContext<TRequest>(null);

const e = mitt();

export const redirect = (url: string, params?: Record<string, string | number | boolean>, hash?: string) => {
  const obj = new URL(url, true);
  obj.set('protocol', '');
  obj.set('host', '');
  obj.set('query', params);
  obj.set('hash', hash);
  e.emit('redirect', obj.toString());
}

export const replace = (url: string, params?: Record<string, string | number | boolean>, hash?: string) => {
  const obj = new URL(url, true);
  obj.set('protocol', '');
  obj.set('host', '');
  obj.set('query', params);
  obj.set('hash', hash);
  e.emit('replace', obj.toString());
}

export function createServer(mode: THistoryMode) {
  if (mode === 'popstate') {
    if (!window.history.pushState || window.location.protocol.toLowerCase().indexOf('file:') === 0) {
      mode = 'hashchange';
    }
  }

  const formatHash = (hash?: string) => {
    if (!hash) return '/';
    return hash.startsWith('#') ? hash.substring(1) : hash;
  }

  const router = new Router({
    maxParamLength: +Infinity,
    caseSensitive: true,
    ignoreTrailingSlash: true,
  })

  const Application = (props: PropsWithChildren<{ href: string }>) => {
    const object = useMemo(() => {
      const url = new URL(props.href || '/', true);
      const matched = router.find(url.pathname);
      const state: TRequest = {
        hash: url.hash,
        pathname: url.pathname,
        query: url.query,
        params: matched ? matched.params : {},
      }
      return {
        state,
        children: matched 
          ? createElement(matched.handler as FunctionComponent<Partial<TRequest>>, state) 
          : props.children,
      }
    }, [props.href]);
    return createElement(RequestContext.Provider, { value: object.state }, object.children);
  }

  const Browser = (props: PropsWithChildren<{}>) => {
    const [href, setHref] = useState<string>(null);
    const _href = useDeferredValue(href);
    useEffect(() => {
      const handler = () => setHref(mode === 'hashchange' ? formatHash(window.location.hash) : window.location.href);
      const _handler = () => e.emit('change');
      e.on('change', handler);
      window.addEventListener(mode, _handler);
      handler();
      return () => {
        e.off('change', handler);
        window.removeEventListener(mode, _handler);
      }
    }, []);
    return createElement(Application, { href: _href }, props.children);
  }

  const middlewares: TUseWidgetState[] = [];
  const use = <P>(cmp: TComponent<P>, props?: P) => middlewares.push(transformComponent(cmp, props));

  const createMiddlewares = (widget: FunctionComponent<TRequest>, mds: TUseWidgetState[]) => {
    return (props: PropsWithoutRef<TRequest>) => {
      let i = mds.length;
      let next: FunctionComponentElement<any> = createElement(widget, props);
      while (i--) {
        next = createElement(mds[i].widget, mds[i].props, next);
      }
      return next;
    }
  }

  const createPathRule = (path: string, cmp: TComponent) => {
    const _middlewres = middlewares.slice(0);
    const isWidgetComponent = isWidget(cmp);
    if (isWidgetComponent && !Reflect.hasMetadata(widgetRenderMetadataNameSpace, cmp)) {
      throw new Error('target is not a IOC component');
    }
    if (isWidgetComponent && !Reflect.hasMetadata(widgetControllerMetadataNameSpace, cmp)) {
      throw new Error('target miss initialize method');
    }
    let component: FunctionComponent = isWidgetComponent
      ? Reflect.getMetadata(widgetControllerMetadataNameSpace, cmp)
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

  const replaceHash = (path: string) => {
    const i = window.location.href.indexOf('#');
    window.location.replace(
      window.location.href.slice(0, i >= 0 ? i : 0) + '#' + path
    )
  }

  e.on('redirect', (url: string,  title: string = window.document.title) => {
    switch (mode) {
      case 'hashchange':
        window.location.hash = url;
        break;
      case 'popstate':
        window.history.pushState(null, title, url);
        e.emit('change');
        break;
    }
  })

  e.on('replace', (url: string, title: string = window.document.title) => {
    switch (mode) {
      case 'hashchange':
        replaceHash(url);
        break;
      case 'popstate':
        window.history.replaceState(null, title, url);
        e.emit('change');
        break;
    }
  })

  return {
    use,
    Browser,
    Application,
    createPathRule,
    createService,
  }
}