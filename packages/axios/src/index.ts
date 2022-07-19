import axios, { AxiosRequestConfig } from 'axios';
import { useSuspense } from '@coka/coka';
import { useEffect, useRef, useState } from 'react';
import { useAsyncCallback } from 'react-async-hook';

interface TAxiosRequestConfig<P = any> extends AxiosRequestConfig<P> {
  abortable?: boolean,
  id?: string,
}

export function createUseAxiosInstance(configs?: AxiosRequestConfig) {
  const instance = axios.create(configs);

  const createRequestCallback = <R = any, P = any>(options: TAxiosRequestConfig<P>) => {
    const abortRef = useRef<AbortController>();
    return useAsyncCallback(() => {
      if (options.abortable) {
        if (abortRef.current) {
          abortRef.current.abort();
        }
        abortRef.current = new AbortController();
        options.signal = abortRef.current.signal;
      }
      return instance(options).then(res => res.data as R);
    });
  }

  const useSuspensable = <R = any, P = any>(id: string, options: TAxiosRequestConfig<P>) => {
    return useSuspense(id, () => {
      return instance(options).then(res => res.data as R);
    })
  }

  const useRequestCallback = <R = any, P = any>(options: Omit<TAxiosRequestConfig<P>, 'id'>) => {
    const target = createRequestCallback<R, P>(options);
    return {
      ...target,
      error: target.error?.message,
      data: target.result,
    }
  }

  const useRequest = <R = any, P = any>(options: TAxiosRequestConfig<P>) => {
    const [initState, _error] = useSuspensable(options.id, options);
    const [state, setState] = useState(initState);
    const [error, setError] = useState(_error);
    const [fetched, setFetched] = useState(false);
    const target = createRequestCallback<R, P>(options);

    useEffect(() => {
      if (fetched) setState(target.result);
      setFetched(true);
    }, [target.result]);

    useEffect(() => {
      if (fetched) setError(target.error?.message);
      setFetched(true);
    }, [target.error?.message]);

    return {
      ...target,
      error,
      data: state,
    }
  }

  return {
    instance,
    useRequest,
    useRequestCallback,
  }
}