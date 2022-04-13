export const MemoDecoratorNameSpace = 'react.memo';
export const memo: MethodDecorator = (target, property, descriptor) => {
  if (property !== 'render') throw new Error('Cannot set memo on ' + String(property));
  Reflect.defineMetadata(MemoDecoratorNameSpace, true, descriptor.value);
}