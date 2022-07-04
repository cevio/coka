import React from 'react';
import { createServer, CokaServerProvider, CokaServerContext } from '../packages/coka/src';
import { IncomingMessage, ServerResponse } from 'http';
import createRouter from './router';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';
const isdev = true;
export default function CokaServerRender(req: IncomingMessage, res: ServerResponse) {
  const application = createServer();
  const context = new CokaServerContext();
  const Application = application.Application;
  const host = req.headers.host || '127.0.0.1';
  // @ts-ignore
  const url = 'http://' + host + (req.originalUrl || req.url);
  createRouter(application);
  const options: RenderToPipeableStreamOptions = {
    onShellReady() {
      res.statusCode = 200;
      res.setHeader("Content-type", "text/html");
      stream.pipe(res);
    },
    onError(e: any) {
      res.statusCode = 500;
      res.end(e.stack);
      stream.abort();
    },
    onAllReady() {
      res.write(`<script>;window.__COKA_INITIALIZE_STATE__ = ${JSON.stringify(context.toJSON())};</script>`);
    }
  }
  if (isdev) {
    options.bootstrapModules = ['/src/client.tsx']
  } else {
    options.bootstrapScripts = ['/assets/index.c2e84879.js']
  }
  const stream = renderToPipeableStream(
    <Html>
      <CokaServerProvider.Provider value={context}>
        <Application href={url}>404 Not Found</Application>
      </CokaServerProvider.Provider>
    </Html>, options)
  return stream;
}

function Html(props: React.PropsWithChildren<{}>) {
  return <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="google" content="notranslate" />
      <meta name="keywords" content="" />
      <meta name="description" content="" />
      <meta name="generator" content="slox + react + antd" />
      <meta name="robots" content="all" />
      <link rel="icon" type="image/svg+xml" href="/src/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>又一个Coka项目</title>
      {/* <link rel="stylesheet" href="/node_modules/antd/lib/style/index.css" /> */}
    </head>
    <body>
      <div id="root">{props.children}</div>
      {/* <script type="module" src="/src/client.tsx"></script> */}
    </body>
  </html>
}