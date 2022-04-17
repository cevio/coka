import React, { lazy, Suspense, useId } from 'react';
import { injectable } from 'inversify';
import { Component, widget, Widget, TRequest, memo, controller, useCokaEffect } from '../packages/coka/src';

const Mathic = lazy(() => import('./math'));

@widget
@injectable()
@controller()
export default class DemoExample extends Component implements Widget<{ abc: number }> {
  public initialize(props: TRequest) {
    const [data] = useCokaEffect(() => new Promise<string[]>(resolve => {
      setTimeout(() => {
        resolve([
          "3. Wait, it doesn't wait for React to load?",
          '3. How does this even work?',
          '3. I like marshmallows',
        ])
      }, 2000);
    }), []);
    return {
      abc: Number(props.query.a || '0') + 100,
      data
    }
  }

  @memo
  public render(props: { abc: number, data: string[] }) {
    const id = useId();
    const _data = props.data || [];
    return <div onClick={() => this.redirect('/222', { t: Date.now() })}>
      {props.abc} + [{id}]
      <Suspense fallback="loading"><Mathic x={100} /></Suspense>
      <hr />
      {
        _data.map(d => <p key={d}>{d}</p>)
      }
    </div>
  }
}