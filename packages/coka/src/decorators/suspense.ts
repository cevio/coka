import 'reflect-metadata';
import { ReactElement } from 'react';
export const SuspenseDecoratorNameSpace = 'react.suspense';
export const suspensable: (dom?: ReactElement) => MethodDecorator = dom => {
  return (target, property, descriptor) => {
    if (property !== 'render') throw new Error('Cannot set memo on ' + String(property));
    Reflect.defineMetadata(SuspenseDecoratorNameSpace, dom || null, descriptor.value);
  }
}