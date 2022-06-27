import { createServer, PluginOption, ViteDevServer } from 'vite';
import { loadConfigs } from '../config';
import { buildHTML } from '../html';
import { TConfigs } from '../types';

export async function createViteDevServer(mode: 'web' | 'ssr') {
  process.env.NODE_ENV = 'development';
  const configs = loadConfigs();
  if (mode === 'web') await buildHTML(configs);
  const plugins: PluginOption[] = [];
  if (mode === 'ssr') {
    plugins.push(createViteDevServerPlugin(configs));
  }
  const server = await createServer({
    clearScreen: true,
    server: {
      host: true,
    },
    define: {
      WINDOW_NAMESPACE: JSON.stringify(configs.namespace.window),
    },
    plugins,
  })
  await server.listen();
  server.printUrls();
}

export function createViteDevServerPlugin(configs: TConfigs): PluginOption {
  return {
    name: 'vite:coka:dev',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = decodeURI(generateUrl(req.url));
        if (!url.endsWith('.html') && url !== '/') return next();
        if (configs.rewrites[url]) req.url = configs.rewrites[url];
        try {
          const renderer = await server.ssrLoadModule(configs.input.server);
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

export function generateUrl(url?: string): string {
  if (!url) {
    return '/'
  }
  // url with parameters
  if (url.indexOf('?') > 0) {
    return url.split('?')[0]
  }
  return url
}