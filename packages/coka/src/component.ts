import { parse, format, UrlWithParsedQuery } from 'url';
import { injectable, interfaces } from 'inversify';
import { FunctionComponent, useMemo } from 'react';
import { redirect, replace } from './coka';
import { widgetRenderMetadataNameSpace } from './decorators';
import { useHash, useParam, usePath, useQuery } from './hooks';

export type TComponent<P = any> = interfaces.Newable<Widget<P>> | FunctionComponent<P>;
export interface Widget<P = any> extends Component {
  readonly render: FunctionComponent<P>,
}

@injectable()
export class Component {
  public readonly usePath = usePath;
  public readonly useHash = useHash;
  public readonly useWidget = useWidget;
  public readonly useParam = useParam; 
  public readonly useQuery = useQuery;

  public redirect(url: string, params?: UrlWithParsedQuery['query'], hash?: string) {
    const obj = parse(url, true);
    obj.query = params;
    obj.hash = hash;
    return redirect(format(obj));
  }

  public replace(url: string, params?: UrlWithParsedQuery['query'], hash?: string) {
    const obj = parse(url, true);
    obj.query = params;
    obj.hash = hash;
    return replace(format(obj));
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

export function transformWidget<P>(clazz: any): FunctionComponent<P> {
  if (!isWidget(clazz)) return clazz as FunctionComponent<P>;
  if (!Reflect.hasMetadata(widgetRenderMetadataNameSpace, clazz)) {
    throw new Error('target is not a IOC widget');
  }
  return Reflect.getMetadata(widgetRenderMetadataNameSpace, clazz) as FunctionComponent<P>
}