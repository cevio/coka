import React from 'react';

export const Layout = React.memo((props: React.PropsWithChildren<{}>) => {
  console.log('in layout')
  return <section>
    <header>
    <img src="https://cn.vitejs.dev/logo.svg" width={16} />
          <span>百准数据组件</span>
    </header>
    <article>{props.children}</article>
    <footer>
      <div>根据 MIT 许可证发布。</div>
      <div>Copyright © 2019-present Evan You & Vite Contributors</div>
    </footer>
  </section>
})