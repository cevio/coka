import React, { createElement } from 'react';
import { IncomingMessage, ServerResponse } from 'http';
import { createServer, CokaServerProvider, CokaServerContext } from '@coka/coka';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';

export interface TOptions {
  html: React.FunctionComponent<React.PropsWithChildren>,
  notFound: React.FunctionComponent,
  namespace?: string,
}

export default (options: TOptions, callback: (app: ReturnType<typeof createServer>) => void) => {
  const Html = options.html;
  const NotFound = options.notFound;
  return (req: IncomingMessage, res: ServerResponse) => {
    const application = createServer();
    const Application = application.Application;
    const context = new CokaServerContext();
    const host = req.headers.host || '127.0.0.1';
    const url = 'http://' + host + req.url;
    callback(application);
    const configs: RenderToPipeableStreamOptions = {
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
        const namespace = options.namespace || '__COKA_INITIALIZE_STATE__';
        res.write(`<script>;window.${namespace} = ${JSON.stringify(context.toJSON())};</script>`);
      }
    }
    
    const app = createElement(Application, { href: url }, createElement(NotFound));
    const provider = createElement(CokaServerProvider.Provider, { value: context }, app);
    const root = createElement(Html, null, provider);
    const stream = renderToPipeableStream(root, configs);
    return stream;
  }
}