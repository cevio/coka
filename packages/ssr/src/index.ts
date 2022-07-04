import React, { createElement } from 'react';
import { IncomingMessage, ServerResponse } from 'http';
import { createServer, CokaServerProvider, CokaServerContext } from '@coka/coka';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';
import { getDevAssets, getProdAssets } from './assets';

export interface THeaderScript {
  type?: string,
  crossOrigin?: 'anonymous' | 'use-credentials',
  src: string,
}

export interface TOptions {
  html: React.FunctionComponent<React.PropsWithChildren<{
    headerScripts?: (string | THeaderScript)[],
    headerPreloadScripts?: string[],
    headerCsses?: string[],
    bodyScripts?: (string | THeaderScript)[],
  }>>,
  notFound: React.FunctionComponent,
  namespace?: string,
  stream?: RenderToPipeableStreamOptions,
}

export default (options: TOptions, callback: (app: ReturnType<typeof createServer>) => void) => {
  const Html = options.html;
  const NotFound = options.notFound;
  const isDev = process.env.NODE_ENV === 'development';
  const assets = isDev ? getDevAssets() : getProdAssets();
  return (req: IncomingMessage, res: ServerResponse, next: Function) => {
    const application = createServer();
    const Application = application.Application;
    const context = new CokaServerContext();
    const host = req.headers.host || '127.0.0.1';
    // @ts-ignore
    const originalUrl = req.originalUrl as string;
    const _url = originalUrl || req.url;
    const url = 'http://' + host + _url;
    callback(application);
    if (!application.matchable(_url)) return next();
    const configs: RenderToPipeableStreamOptions = {
      ...options.stream,
      onShellReady() {
        res.statusCode = 200;
        res.setHeader("Content-type", "text/html");
        stream.pipe(res);
        options?.stream?.onShellReady();
      },
      onError(e: any) {
        res.statusCode = 500;
        res.end(e.stack);
        stream.abort();
        options?.stream?.onError(e);
      },
      onAllReady() {
        const namespace = options.namespace || '__COKA_INITIALIZE_STATE__';
        res.write(`<script>;window.${namespace} = ${JSON.stringify(context.toJSON())};</script>`);
        options?.stream?.onAllReady();
      }
    }
    
    const app = createElement(Application, { href: url }, createElement(NotFound));
    const provider = createElement(CokaServerProvider.Provider, { value: context }, app);
    const root = createElement(Html, assets, provider);
    const stream = renderToPipeableStream(root, configs);
    return stream;
  }
}