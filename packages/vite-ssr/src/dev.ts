import { ViteDevServer } from 'vite';
import { generateUrl } from './utils';

export interface TDevConfigs {
  serverEntryFile: string,
  rewrites: Record<string, string>,
}

export function createCokaDevServer(configs: TDevConfigs) {
  return {
    name: 'vite:coka:dev',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = decodeURI(generateUrl(req.url));
        if (!url.endsWith('.html') && url !== '/') return next();
        if (configs.rewrites[url]) req.url = configs.rewrites[url];
        try {
          const renderer = await server.ssrLoadModule(configs.serverEntryFile);
          if (typeof renderer.default !== 'function') return next();
          renderer.default(req, res);
        } catch(e) {
          server.ssrFixStacktrace(e);
          res.statusCode = 500;
          res.end(e.message);
        }
      });
    }
  }
}