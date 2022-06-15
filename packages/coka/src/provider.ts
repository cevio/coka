import { createContext, useContext } from 'react';
import { RuntimeModeContext } from './coka';
import { TUseData } from './types';

export class CokaServerContext extends Map<string, TUseData> {
  public toJSON() {
    const res: Record<string, TUseData> = {};
    for (const [key, value] of this) {
      res[key] = value.data;
    }
    return res;
  }
}

export const CokaServerProvider = createContext(new CokaServerContext());

export function useSuspense<T = any>(key: string, fetcher: () => Promise<T>): T {
  const ctx = useContext(CokaServerProvider);
  const mode = useContext(RuntimeModeContext);
  const mutate = () => {
    const target = ctx.get(key);
    target.isValidating = true;
    return fetcher().then(
      (r) => {
        target.isValidating = false;
        target.data = r;
        return r;
      },
      (err) => {
        target.isValidating = false;
        return Promise.reject(err);
      }
    );
  }
  const createFetcher = () => () => {
    const target: TUseData<T> = ctx.get(key);
    const { data, isValidating, promise } = target;
    if (data !== undefined && !isValidating) {
      return data;
    }
    if (!promise) {
      target.promise = mutate();
    }
    throw target.promise;
  };

  if (!ctx.has(key)) {
    ctx.set(key, {
      data: undefined,
      promise: null,
      isValidating: false,
      fn: createFetcher(),
    })
  } else if (mode === 'client') {
    const target = ctx.get(key);
    target.fn = createFetcher();
  }
  const target = ctx.get(key) as TUseData<T>;
  return target.fn();
}