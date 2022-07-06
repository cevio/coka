import React, { createElement, FunctionComponent } from "react";
import { TRequest } from "./coka";
import { TUseWidgetState } from "./decorators";

export class WidgetInstance {
  constructor(
    private readonly widget: FunctionComponent<TRequest>,
    private readonly middlewares: TUseWidgetState[],
  ) {}

  public render(state: TRequest): React.ReactNode {
    if (!this.widget) return null;
    let i = this.middlewares.length;
    let next: React.ReactNode = createElement(this.widget, state);
    while (i--) {
      next = createElement(this.middlewares[i].widget, this.middlewares[i].props, next);
    }
    return next;
  }
}
