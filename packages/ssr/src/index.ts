import React, { createElement } from 'react';
import { IncomingMessage, ServerResponse } from 'http';
import { createServer, CokaServerProvider, CokaServerContext } from '@coka/coka';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';
import { TAssets, THTML } from '@coka/cli';

export default (
  htmlComponent: THTML, 
  notFoundComponent: React.FunctionComponent, 
  routerCallback: (app: ReturnType<typeof createServer>) => void
) => {
  const Html = htmlComponent;
  const NotFound = notFoundComponent;
  return async (opts: {
    assets: TAssets, 
    req: IncomingMessage, 
    res: ServerResponse, 
    next: Function,
    namespace: string,
    dev?: boolean,
  }) => {
    const { assets, req, res, next, namespace } = opts;
    const application = createServer();
    const Application = application.Application;
    const context = new CokaServerContext();
    const host = req.headers.host || '127.0.0.1';
    // @ts-ignore
    const originalUrl = req.originalUrl as string;
    const _url = originalUrl || req.url;
    const url = 'http://' + host + _url;
    routerCallback && routerCallback(application);
    if (!application.matchable(_url)) return await Promise.resolve(next());
    await new Promise<void>((resolve, reject) => {
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
          reject(e);
        },
        onAllReady() {
          // const namespace = options.namespace || '__COKA_INITIALIZE_STATE__';
          res.write(`<script>;window.${namespace} = ${JSON.stringify(context.toJSON())};</script>`);
          resolve();
        }
      }
      /**
       * headers from http
       */
      const app = createElement(Application, { href: url, headers: req.headers }, createElement(NotFound));
      const provider = createElement(CokaServerProvider.Provider, { value: context }, app);
      const root = createElement(Html, { assets, dev: opts.dev }, provider);
      const stream = renderToPipeableStream(root, configs);
    });
  }
}