import { Emitter, EventType } from "mitt";

export interface TCokaMode  {
  getURL(): string;
  listen(callback: () => void): () => void;
  redirect(url: string, title?: string, onChange?: () => void): void;
  replace?(url: string, title?: string, onChange?: () => void): void;
}