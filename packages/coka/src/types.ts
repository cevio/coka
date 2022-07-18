export interface TCokaMode  {
  getURL(): string;
  listen(callback: () => void): () => void;
  redirect(url: string, title?: string, onChange?: () => void): void;
  replace?(url: string, title?: string, onChange?: () => void): void;
}

export interface TCokaServerProviderState<T = any> {
  r: T,
  s: -1 | 0 | 1 | 2,
  p: Promise<void>,
  e: any
}

export interface TUseData<T = any> {
  isValidating: boolean,
  data: T,
  error: Error,
  promise: Promise<T>,
  fn?: () => [T, Error]
}

export type TCokaRuntimeMode = 'browser' | 'client' | 'server';