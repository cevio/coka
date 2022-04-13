# @coka/coka

A javascript framework for building user interfaces with react 18

## Usage

```bash
$ npm i @coka/coka
```

## Example

```ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import { inject, injectable } from 'inversify';
import { createServer, Component, widget, Widget, container, middleware, redirect, TRequest, memo, controller } from '@coka/coka';

const { Browser, createPathRule, use, createService } = createServer('hashchange');

function ggg(props: React.PropsWithChildren<{ x: number }>) {
  return <div>
    <p>x: {props.x}</p>
    {props.children}
  </div>
}

@injectable()
class def {

}

// 定义IOC组件
@widget
@injectable()
@controller('/')
@middleware(ggg, { x: 3 }) // 中间件组件
@middleware(ggg, { x: 4 }) // 中间件组件
class abc extends Component implements Widget<{ abc: number }> {
  @inject(def) private readonly def: def; // 依赖
  @inject('xxx') private readonly xxx: number; // 依赖

  // 请求数据初始化
  public initialize(props: TRequest) {
    return {
      abc: Number(props.query.a || '0') + 100,
    }
  }

  // 组件渲染函数
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

// 全局中间件
use(ggg, { x: 1 })
use(ggg, { x: 2 })

// 定义路由
createService(abc);
createPathRule('/222', () => {
  return <div onClick={() => redirect('/', { t: Date.now() }, 'test')}>
    aaa
  </div>
});

// React 18 批处理渲染模式
const app = createRoot(document.getElementById('root'));
app.render(<Browser>
  <div>not found</div>
</Browser>);

```