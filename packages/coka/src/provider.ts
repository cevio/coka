import { createContext, useContext, useId } from 'react';
import { TCokaServerProviderState } from './types';
import { useAsync, UseAsyncReturn } from 'react-async-hook';

export const CokaServerProvider = createContext<CokaServerContext>(null);
export class CokaServerContext extends Map<string, TCokaServerProviderState> {
  public createServerProvider<T = any>(namespace: string) {
    if (!this.has(namespace)) {
      this.set(namespace, this.createDefaultState<T>());
    }
    return (fn: () => Promise<T>) => {
      const state = this.get(namespace) as TCokaServerProviderState<T>;
      switch (state.s) {
        case 0:
          state.s = 1;
          state.p = fn().then(this.createResolve(state)).catch(this.createReject(state));
          throw state.p;
        case 1: throw state.p;
        default: return {
          data: state.r,
          error: state.e,
          loading: false,
        };
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

export function useCokaEffect<T extends any[], O = any>(fn: (...args: T) => Promise<O>, deps: T): Partial<UseAsyncReturn<O, T>> & { data: O } {
  const ctx = useContext(CokaServerProvider);
  if (!!ctx) return createServerEffect(ctx, () => fn(...deps));
  const { result, ...extra } = useAsync(fn, deps);
  return {
    ...extra,
    data: result,
  }
}

function createServerEffect<O = any>(ctx: CokaServerContext, callback: () => Promise<O>) {
  const name = useId();
  const execute = ctx.createServerProvider<O>(name);
  return execute(callback);
}