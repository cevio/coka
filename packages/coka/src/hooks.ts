import { useContext } from 'react';
import { RequestContext, RuntimeModeContext } from './coka';

export function useRuntimeMode() {
  return useContext(RuntimeModeContext);
}

export function useQuery<T>(key: string, format?: (v: string | string[]) => T) {
  const request = useContext(RequestContext);
  if (!request) return null;
  const value = request.query[key];
  return format ? format(value) : value;
}

export function useParam<T>(key: string, format?: (v: string) => T) {
  const request = useContext(RequestContext);
  if (!request) return null;
  const value = request.params[key];
  return format ? format(value) : value;
}

export function usePath<T>(format?: (v: string) => T) {
  const request = useContext(RequestContext);
  if (!request) return null;
  const value = request.pathname;
  return format ? format(value) : value;
}

export function useHash<T>(format?: (v: string) => T) {
  const request = useContext(RequestContext);
  if (!request) return null;
  const value = request.hash;
  return format ? format(value) : value;
}