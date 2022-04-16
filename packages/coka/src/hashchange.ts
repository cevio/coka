import { TCokaMode } from './types';

export class CokaHashChangeMode implements TCokaMode {
  private format(hash: string) {
    if (!hash) return '/';
    return hash.startsWith('#') ? hash.substring(1) : hash;
  }

  public getURL(): string {
    return this.format(window.location.hash);
  }

  public listen(callback: () => void) {
    window.addEventListener('hashchange', callback);
    return () => window.removeEventListener('hashchange', callback);
  }

  public redirect(url: string, title?: string): void {
    window.location.hash = url;
    if (title) {
      document.title = title;
    }
  }

  public replace(path: string, title?: string): void {
    const i = window.location.href.indexOf('#');
    window.location.replace(
      window.location.href.slice(0, i >= 0 ? i : 0) + '#' + path
    )
    if (title) {
      document.title = title;
    }
  }
}