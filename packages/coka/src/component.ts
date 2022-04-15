import URL from 'url-parse';
import { injectable, interfaces } from 'inversify';
import { FunctionComponent, useMemo } from 'react';
import { TRequest, redirect, replace } from './coka';
import { widgetRenderMetadataNameSpace } from './decorators';
import { useHash, useParam, usePath, useQuery } from './hooks';

export type TComponent<P = any> = interfaces.Newable<Widget<P>> | FunctionComponent<P>;
export interface Widget<P = any> extends Component {
  readonly render: FunctionComponent<P>,
  readonly initialize?: (props: TRequest) => P,
}

@injectable()
export class Component {
  public readonly usePath = usePath;
  public readonly useHash = useHash;
  
  public useWidget<P = {}>(clazz: interfaces.Newable<Widget<P>>) {
    return useWidget(clazz);
  }

  public redirect(url: string, params?: Record<string, string | number | boolean>, hash?: string) {
    const obj = new URL(url, true);
    obj.set('protocol', '');
    obj.set('host', '');
    obj.set('query', params);
    obj.set('hash', hash);
    return redirect(obj.toString());
  }

  public replace(url: string, params?: Record<string, string | number | boolean>, hash?: string) {
    const obj = new URL(url, true);
    obj.set('protocol', '');
    obj.set('host', '');
    obj.set('query', params);
    obj.set('hash', hash);
    return replace(obj.toString());
  }

  public useParam(...args: Parameters<typeof useParam>) {
    return useParam(...args);
  }

  public useQuery(...args: Parameters<typeof useQuery>) {
    return useQuery(...args);
  }
}

export function isWidget(target: TComponent) {
  if (typeof target !== 'function') return false;
  if (!(target.prototype instanceof Component)) return false;
  const object = target.prototype as Widget;
  if (typeof object.render !== 'function') return false;
  return true;
}

export function useWidget<P = {}>(clazz: interfaces.Newable<Widget<P>>) {
  return useMemo(() => {
    if (!isWidget(clazz)) throw new Error('target is not a IOC widget');
    if (!Reflect.hasMetadata(widgetRenderMetadataNameSpace, clazz)) {
      throw new Error('target is not a IOC widget');
    }
    return Reflect.getMetadata(widgetRenderMetadataNameSpace, clazz) as FunctionComponent<P>
  }, [clazz]);
}