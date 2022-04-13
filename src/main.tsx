import React from 'react';
import { createRoot } from 'react-dom/client';
import { inject, injectable } from 'inversify';
import { createServer, Component, widget, Widget, container, middleware, redirect, TRequest, memo } from '@coka/coka';

const { Browser, createPathRule, use } = createServer('hashchange');

container.bind('xxx').toConstantValue(3);

function ggg(props: React.PropsWithChildren<{ x: number }>) {
  return <div>
    <p>x: {props.x}</p>
    {props.children}
  </div>
}

@injectable()
class def {

}

@widget
@injectable()
@middleware(ggg, { x: 3 })
@middleware(ggg, { x: 4 })
class abc extends Component implements Widget<{ abc: number }> {
  @inject(def) private readonly def: def;
  @inject('xxx') private readonly xxx: number;

  public initialize(props: TRequest) {
    return {
      abc: Number(props.query.a || '0') + 100,
    }
  }

  @memo
  public render(props: { abc: number }) {
    return <div onClick={() => redirect('/222', { t: Date.now() })}>
      {props.abc}
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <div id="test">test id container</div>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
    </div>
  }
}

use(ggg, { x: 1 })
use(ggg, { x: 2 })

createPathRule('/', abc);
createPathRule('/222', () => <div onClick={() => redirect('/', { t: Date.now() }, 'test')}>
  aaa
</div>);

const app = createRoot(document.getElementById('root'));
app.render(<Browser>
  <div>not found</div>
</Browser>);