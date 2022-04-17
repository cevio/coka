import React from 'react';
import { createServer as createHttpServer } from 'http';
import { renderToPipeableStream } from 'react-dom/server';
// import { DemoExample } from '../src/comp';
import { createServer, CokaServerContext, CokaServerProvider, loadController } from '../packages/coka/src';

createHttpServer((req, res) => {
  const { createPathRule, Application } = createServer();
  createPathRule('/', loadController(() => import('../src/comp'), <span style={{ color: 'red' }}>loading</span>));
  const context = new CokaServerContext();
  const stream = renderToPipeableStream(
    <html>
      <title>ssr</title>
      <body>
        <CokaServerProvider.Provider value={context}>
          <Application href={req.url}>404 Not Found</Application>
        </CokaServerProvider.Provider>
      </body>
    </html>
    ,
    {
      onShellReady() {
        // If something errored before we started streaming, we set the error code appropriately.
        res.statusCode = 200;
        res.setHeader("Content-type", "text/html");
        stream.pipe(res);
      },
      onError(x: any) {
        res.statusCode = 500;
        res.end(x.stack)
        stream.abort();
      }
    }
  )
}).listen(9900, () => console.log('on 9900'));