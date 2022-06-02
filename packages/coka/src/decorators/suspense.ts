import 'reflect-metadata';
import { ReactNode } from 'react';
export const SuspenseDecoratorNameSpace = 'react.suspense';
export const suspensable: (dom?: ReactNode) => MethodDecorator = dom => {
  return (target, property, descriptor) => {
    if (property !== 'render') throw new Error('Cannot set memo on ' + String(property));
    Reflect.defineMetadata(SuspenseDecoratorNameSpace, dom || null, descriptor.value);
  }
}