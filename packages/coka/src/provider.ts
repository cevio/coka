import { createContext, useContext } from 'react';
import { RuntimeModeContext } from './coka';
import { TUseData } from './types';

export class CokaServerContext extends Map<string, TUseData> {
  public toJSON() {
    const res: Record<string, { data: any, error?: string }> = {};
    for (const [key, value] of this) {
      res[key] = {
        data: value.data,
        error: value.error,
      };
    }
    return res;
  }
}

export const CokaServerProviderContext = new CokaServerContext();
export const CokaServerProvider = createContext(CokaServerProviderContext);

export function useSuspense<T = any>(key: string, fetcher: () => Promise<T>): [T, any?] {
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
        target.error = err.message;
        return Promise.reject(err);
      }
    );
  }
  const createFetcher: () => () => [T, string?] = () => () => {
    const target: TUseData<T> = ctx.get(key);
    const { data, isValidating, promise, error } = target;
    if (error && !isValidating) {
      return [undefined, error];
    }
    if (data !== undefined && !isValidating) {
      return [data, undefined];
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
      error: null,
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