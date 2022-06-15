import React, { createElement } from 'react';
import { IncomingMessage, ServerResponse } from 'http';
import { createServer, CokaServerContext, CokaServerProvider } from '@coka/coka';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';

export interface TOptions {
  html: React.FunctionComponent<React.PropsWithChildren>,
  notFound: React.FunctionComponent,
}

export default (options: TOptions) => {
  const Html = options.html;
  const NotFound = options.notFound;
  return (req: IncomingMessage, res: ServerResponse) => {
    const application = createServer();
    const context = new CokaServerContext();
    const Application = application.Application;
    const host = req.headers.host || '127.0.0.1';
    const url = 'http://' + host + req.url;

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
      }
    }
    
    const app = createElement(Application, { href: url }, createElement(NotFound));
    const provider = createElement(CokaServerProvider.Provider, { value: context }, app);
    const root = createElement(Html, null, provider);
    const stream = renderToPipeableStream(root, options);
    return stream;
  }
}