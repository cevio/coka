import { createServer, PluginOption, ViteDevServer } from 'vite';
import { loadConfigs } from '../config';
import { buildHTML, cleanHTML } from '../html';
import { TConfigs } from '../types';
import { getDevAssets } from '../assets';

export async function createViteDevServer(mode: 'web' | 'ssr') {
  process.env.NODE_ENV = 'development';
  const configs = loadConfigs();
  if (mode === 'web') await buildHTML(configs, true);
  const plugins: PluginOption[] = [];
  if (mode === 'ssr') {
    cleanHTML();
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
    config(options) {
      if (!options.server) options.server = {};
      options.server.proxy = configs.proxy;
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        // const root = server.config.root || process.cwd();
        const url = decodeURI(generateUrl(req.url));
        if (configs.rewrites[url]) req.url = configs.rewrites[url];
        if (configs.nexts.includes(url)) return next();
        // if (existsSync(resolve(root, url.startsWith('/') ? '.' + url : url))) return next();
        try {
          const renderer = await server.ssrLoadModule(configs.input.server);
          if (typeof renderer.default !== 'function') return next();
          renderer.default({
            assets: getDevAssets(),
            req, res, next,
            namespace: configs.namespace.window,
            dev: true,
          });
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