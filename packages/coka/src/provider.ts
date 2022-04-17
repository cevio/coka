import React, { createContext, DependencyList, useCallback, useContext, useEffect, useId, useState } from 'react';
import { TCokaServerProviderState } from './types';

export const CokaServerProvider = createContext<CokaServerContext>(null);
export class CokaServerContext extends Map<string, TCokaServerProviderState> {
  public createServerProvider<T = any>(namespace: string): (fn: () => Promise<T>) => readonly [T, any] {
    if (!this.has(namespace)) {
      this.set(namespace, this.createDefaultState<T>());
    }
    return fn => {
      const state = this.get(namespace) as TCokaServerProviderState<T>;
      switch (state.s) {
        case 0:
          state.s = 1;
          state.p = fn().then(this.createResolve(state)).catch(this.createReject(state));
          throw state.p;
        case 1: throw state.p;
        default: return [state.r, state.e] as const;
      }
    }
  }

  private createResolve<T>(state: TCokaServerProviderState<T>) {
    return (r: T) => {
      state.r = r;
      state.s = 2;
    }
  }

  private createReject<T>(state: TCokaServerProviderState<T>) {
    return (e: any) => {
      state.e = e;
      state.s = -1;
    }
  }

  private createDefaultState<T>(): TCokaServerProviderState<T> {
    return {
      r: null, s: 0, p: null, e: null
    }
  }
}

export function useCokaEffect<T extends DependencyList, O = any>(fn: (...args: T) => Promise<O>, deps: T) {
  const ctx = useContext(CokaServerProvider);
  const callback = useCallback(() => fn(...deps), [fn, deps]);
  if (!!ctx) return createServerEffect(ctx, callback);
  const [state, setState] = useState<O>(null);
  const [error, setError] = useState<any>(null);
  useEffect(() => {
    callback().then(setState).catch(setError);
  }, [callback]);
  return [state, error] as const;
}

function createServerEffect<O = any>(ctx: CokaServerContext, callback: () => Promise<O>) {
  const name = useId();
  const execute = ctx.createServerProvider<O>(name);
  return execute(callback);
}