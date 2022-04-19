import React, { useId } from 'react';
import { injectable } from 'inversify';
import { Component, widget, Widget, TRequest, memo, controller, useCokaEffect, dynamic } from '../packages/coka/src';

const Mathic = dynamic(() => import('./math'), <span>loading...</span>);

@widget
@injectable()
@controller()
export default class DemoExample extends Component implements Widget<TRequest> {
  @memo
  public render(props: TRequest) {
    const id = useId();
    const [data] = useCokaEffect(() => new Promise<string[]>(resolve => {
      setTimeout(() => {
        resolve([
          "3. Wait, it doesn't wait for React to load?",
          '3. How does this even work?',
          '3. I like marshmallows',
        ])
      }, 2000);
    }), []);
    const abc = Number(props.query.a || '0') + 100
    const _data = data || [];
    this.redirect('/flex')
    return <div onClick={() => this.redirect('/222', { t: Date.now() + '' })}>
      {abc} + [{id}]
      <Mathic x={100} />
      <hr />
      {
        _data.map(d => <p key={d}>{d}</p>)
      }
    </div>
  }
}