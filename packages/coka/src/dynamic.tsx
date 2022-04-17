import React, { lazy, ReactNode, Suspense } from 'react';
import { transformWidget, TComponent } from './component';
import { TRequest } from './coka';

export function dynamic(factory: () => Promise<any>, loading?: ReactNode) {
  const Component = lazy(() => factory().then(res => {
    const widget = transformWidget(res.default as TComponent<TRequest>);
    return {
      default: widget,
    }
  }));
  return (props: React.PropsWithoutRef<TRequest>) => {
    return <Suspense fallback={loading}>
      <Component {...props} />
    </Suspense>
  }
}