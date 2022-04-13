import React, { FunctionComponent, createElement, PropsWithChildren, ForwardRefRenderFunction } from 'react';
import { interfaces } from 'inversify';
import { Widget, isWidget } from '../component';
import { container, TRequest } from '../coka';
import { AnnotationDependenciesAutoRegister } from './auto';
import { MemoDecoratorNameSpace } from './memo';
import { ForwardRefDecoratorNameSpace } from './forward';

export const widgetRenderMetadataNameSpace = 'widget:render';
export const widgetControllerMetadataNameSpace = 'widget:controller';

/**
 * 组件注解
 * @param target 
 */
export const widget = <P = {}>(target: interfaces.Newable<Widget<P>>) => {
  if (!isWidget(target)) {
    throw new Error('target is not a IOC Widget');
  }
  AnnotationDependenciesAutoRegister(target, container);
  const widget: Widget<P> = container.get(target);
  const isMemo: boolean = Reflect.getMetadata(MemoDecoratorNameSpace, target.prototype.render);
  const isForwardRef: boolean = Reflect.getMetadata(ForwardRefDecoratorNameSpace, target.prototype.render)
  let widgetRender = widget.render.bind(widget) as FunctionComponent<P>;
  if (isForwardRef) widgetRender = React.forwardRef(widgetRender as any) as FunctionComponent<P>;
  if (isMemo) widgetRender = React.memo(widgetRender) as FunctionComponent<P>;
  Reflect.defineMetadata(widgetRenderMetadataNameSpace, widgetRender, target);
  if (typeof widget.initialize === 'function') {
    const controllerRender = (request: PropsWithChildren<TRequest>) => {
      const props = widget.initialize(request);
      return createElement(widgetRender, props);
    }
    Reflect.defineMetadata(widgetControllerMetadataNameSpace, controllerRender, target);
  }
}