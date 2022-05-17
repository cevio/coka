import 'reflect-metadata';
import { interfaces } from 'inversify';
import { FunctionComponent } from 'react';
import { TComponent, Widget, isWidget } from '../component';
import { widgetRenderMetadataNameSpace } from './widget';

export const MiddlewareMetadataNameSpace = 'middleware';
export type TUseWidgetState = { widget: FunctionComponent, props?: any };
/**
 * 控制器注解
 * @param path 
 * @returns 
 */
 export const middleware = <P>(comp: TComponent<P>, props?: P) => {
  return (target: interfaces.Newable<Widget>) => {
    if (!Reflect.hasMetadata(MiddlewareMetadataNameSpace, target)) {
      Reflect.defineMetadata(MiddlewareMetadataNameSpace, [], target);
    }
    const middlewares: TUseWidgetState[] = Reflect.getMetadata(MiddlewareMetadataNameSpace, target);
    middlewares.unshift(transformComponent(comp, props));
    Reflect.defineMetadata(MiddlewareMetadataNameSpace, middlewares, target);
  }
}

export function transformComponent<P>(comp: TComponent<P>, props?: P): TUseWidgetState {
  if (isWidget(comp)) {
    if (!Reflect.hasMetadata(widgetRenderMetadataNameSpace, comp)) {
      throw new Error('target is not a IOC component');
    }
    return {
      widget: Reflect.getMetadata(widgetRenderMetadataNameSpace, comp),
      props,
    }
  }
  return { 
    widget: comp as FunctionComponent<P>, 
    props 
  }
}