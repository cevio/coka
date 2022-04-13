import { interfaces, Container, METADATA_KEY } from 'inversify';
import { Widget } from '../component';
/**
 * 自动绑定容器内的依赖对象
 * @param clazz 待绑定的对象
 * @param container 容器
 * @returns 
 */
export function AnnotationDependenciesAutoRegister<T extends Widget>(clazz: interfaces.Newable<T>, container?: Container) {
  if (typeof clazz !== 'function' || !clazz.prototype) return;
  const rollbacks: (() => void)[] = [];
  const injectable = Reflect.hasMetadata(METADATA_KEY.PARAM_TYPES, clazz);
  if (injectable && container && !container.isBound(clazz)) {
    container.bind(clazz).toSelf().inSingletonScope();
    rollbacks.push(() => container.unbind(clazz));
    const propsInjectable = Reflect.hasMetadata(METADATA_KEY.TAGGED_PROP, clazz);
    if (propsInjectable) {
      const props = Reflect.getMetadata(METADATA_KEY.TAGGED_PROP, clazz);
      for (const key in props) {
        const chunks = props[key] as { key: string, value: any }[];
        if (Array.isArray(chunks)) {
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (chunk.key === 'inject') {
              rollbacks.push(AnnotationDependenciesAutoRegister(chunk.value, container));
            }
          }
        }
      }
    }
  }
  return () => {
    let i = rollbacks.length;
    while (i--) rollbacks[i]();
  }
}