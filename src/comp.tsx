import React, { Suspense, useId } from 'react';
import { injectable } from 'inversify';
import { Component, widget, Widget, TRequest, memo, controller, useSuspense, suspensable } from '../packages/coka/src';
import Mathic from './math';
// const Mathic = dynamic(() => import('./math'), <span>loading...</span>);

@widget
@injectable()
@controller()
export default class DemoExample extends Component implements Widget<TRequest> {
  @memo
  @suspensable(<span style={{ color: 'red' }}>loading</span>)
  public render(props: TRequest) {
    const data = useSuspense('t3', () => {
      return new Promise<string[]>(resolve => {
        setTimeout(() => {
          console.log('get', 3)
          resolve([
            "3. Wait, it doesn't wait for React to load?",
            '3. How does this even work?',
            '3. I like marshmallows',
          ])
        }, 2000);
      })
    })
    
    const abc = Number(props.query.a || '0') + 100
    const _data = data || [];
    return <div>
      <p onClick={() => alert(3)}>{abc}</p>
      <Suspense fallback="loading...">
        <Mathic x={100} />
      </Suspense>
      <hr />
      {
        _data.map(d => <p key={d}>{d}</p>)
      }
    </div>  
  }
}