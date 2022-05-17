import 'reflect-metadata';
export const ForwardRefDecoratorNameSpace = 'react.forward';
export const forwardRef: MethodDecorator = (target, property, descriptor) => {
  if (property !== 'render') throw new Error('Cannot set forwardref on ' + String(property));
  Reflect.defineMetadata(ForwardRefDecoratorNameSpace, true, descriptor.value);
}