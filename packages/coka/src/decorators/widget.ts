import 'reflect-metadata';
import React, { FunctionComponent, createElement, Suspense } from 'react';
import { interfaces } from 'inversify';
import { Widget, isWidget } from '../component';
import { container } from '../coka';
import { AnnotationDependenciesAutoRegister } from './auto';
import { MemoDecoratorNameSpace } from './memo';
import { ForwardRefDecoratorNameSpace } from './forward';
import { SuspenseDecoratorNameSpace } from './suspense';

export const widgetRenderMetadataNameSpace = 'widget:render';

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
  const isForwardRef: boolean = Reflect.getMetadata(ForwardRefDecoratorNameSpace, target.prototype.render);
  const isSuspense: boolean = Reflect.hasMetadata(SuspenseDecoratorNameSpace, target.prototype.render);
  let widgetRender = widget.render.bind(widget) as FunctionComponent<P>;
  if (isSuspense) {
    const dom = Reflect.getMetadata(SuspenseDecoratorNameSpace, target.prototype.render);
    const _widgetRender = widgetRender;
    widgetRender = props => createElement(Suspense, { fallback: dom }, createElement(_widgetRender, props));
  }
  if (isForwardRef) widgetRender = React.forwardRef(widgetRender as any) as FunctionComponent<P>;
  if (isMemo) widgetRender = React.memo(widgetRender) as FunctionComponent<P>;
  Reflect.defineMetadata(widgetRenderMetadataNameSpace, widgetRender, target);
}