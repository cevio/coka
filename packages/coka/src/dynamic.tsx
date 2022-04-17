import React, { lazy, ReactNode, Suspense, PropsWithRef } from 'react';
import { transformWidget, TComponent } from './component';

type DrawoutDynamicWidget<T> = T extends { default: TComponent<infer R> } ? R : T;
export function dynamic<T>(factory: () => Promise<T>, loading?: ReactNode, control?: boolean) {
  type P = DrawoutDynamicWidget<T>;
  const Component = lazy(() => factory().then((res) => {
    // @ts-ignore
    const widget = transformWidget<P>(res.default, control);
    return {
      default: widget,
    }
  }));
  return (props: JSX.IntrinsicAttributes & PropsWithRef<P>) => {
    return <Suspense fallback={loading}>
      <Component {...props} />
    </Suspense>
  }
}

export function loadController<T>(factory: () => Promise<T>, loading?: ReactNode) {
  return dynamic(factory, loading, true);
}