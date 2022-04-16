import { TCokaMode } from './types';
import { Emitter, EventType } from "mitt";

export class CokaPopStateMode implements TCokaMode {
  public getURL(): string {
    return window.location.href;
  }

  public listen(callback: () => void) {
    window.addEventListener('popstate', callback);
    return () => window.removeEventListener('popstate', callback);
  }

  public redirect(url: string, title: string = window.document.title, onChange?: () => void): void {
    window.history.pushState(null, title, url);
    onChange();
  }

  public replace(url: string, title: string = window.document.title, onChange?: () => void): void {
    window.history.replaceState(null, title, url);
    onChange();
  }
}