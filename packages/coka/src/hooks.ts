import { useContext } from 'react';
import { RequestContext } from './coka';

export function useQuery<T>(key: string, format?: (v: string) => T) {
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