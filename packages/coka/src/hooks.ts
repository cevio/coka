import { useContext } from 'react';
import { RequestContext, RuntimeModeContext } from './coka';
import { TUseData } from './types';

const cache: Record<string, TUseData> = {};

export function useRuntimeMode() {
  return useContext(RuntimeModeContext);
}

export function useQuery<T>(key: string, format?: (v: string | string[]) => T) {
  const request = useContext(RequestContext);
  const value = request.query[key];
  return format ? format(value) : value;
}

export function useParam<T>(key: string, format?: (v: string) => T) {
  const request = useContext(RequestContext);
  const value = request.params[key];
  return format ? format(value) : value;
}

export function usePath<T>(format?: (v: string) => T) {
  const request = useContext(RequestContext);
  const value = request.pathname;
  return format ? format(value) : value;
}

export function useHash<T>(format?: (v: string) => T) {
  const request = useContext(RequestContext);
  const value = request.hash;
  return format ? format(value) : value;
}

export function useData<T = any>(
  key: string, 
  fetcher: (key?: string) => Promise<T>, 
  deps: any[] = []
) {
  function mutate() {
    cache[key].isValidating = true;
    return fetcher(key).then(
      (r) => {
        cache[key].isValidating = false;
        cache[key].data = r;
        return r;
      },
      (err) => {
        cache[key].isValidating = false;
        console.error(err);
      }
    );
  }

  const createFetcher = () => () => {
    const { data, isValidating, promise } = cache[key];
    if (data !== undefined && !isValidating) {
      return data;
    }
    if (!promise) {
      cache[key].promise = mutate();
    }
    throw cache[key].promise;
  };

  if (!cache[key]) {
    cache[key] = {
      data: undefined,
      promise: null,
      isValidating: false,
    };
    cache[key].fn = createFetcher();
  }

  return cache[key].fn();
}