import { sync } from '@stdlib/fs-resolve-parent-path';
import { TConfigs } from './types';

const filename = 'coka.config.json';

export function loadConfigs(dir: string = process.cwd()): TConfigs {
  const _ = createDefaultConfigs();
  const filepath = sync(filename, { dir });
  if (!filepath) return _;
  const _configs = require(filepath) as TConfigs;
  if (!_configs.namespace) _configs.namespace = _.namespace;
  if (!_configs.namespace.window) _configs.namespace.window = _.namespace.window;
  if (!_configs.namespace.file) _configs.namespace.file = _.namespace.file;

  if (!_configs.input) _configs.input = _.input;
  if (!_configs.input.web) _configs.input.web = _.input.web;
  if (!_configs.input.client) _configs.input.client = _.input.client;
  if (!_configs.input.server) _configs.input.server = _.input.server;
  if (!_configs.input.html) _configs.input.html = _.input.html;

  if (!_configs.output) _configs.output = _.output;
  if (!_configs.output.web) _configs.output.web = _.output.web;
  if (!_configs.output.client) _configs.output.client = _.output.client;
  if (!_configs.output.server) _configs.output.server = _.output.server;

  if (!_configs.rewrites) _configs.rewrites = _.rewrites;
  _configs.rewrites = Object.assign(_.rewrites, _configs.rewrites);

  if (!_configs.nexts) _configs.nexts = [];
  const nexts = new Set(_configs.nexts.concat(_.nexts || []));
  _configs.nexts = Array.from(nexts.values());

  if (!_configs.proxy) _configs.proxy = {};
  _configs.proxy = Object.assign(_configs.proxy, _.proxy || {});

  return _configs;
}

function createDefaultConfigs(): TConfigs {
  return {
    namespace: {
      window: '__COKA_VITE_INITIALIZE_STATE__',
      file: 'index'
    },
    input: {
      web: '/src/entry-web.tsx',
      client: '/src/entry-client.tsx',
      server: '/src/entry-server.tsx',
      html: 'src/template.tsx',
    },
    output: {
      web: 'dist/web',
      client: 'dist/client',
      server: 'dist/server'
    },
    rewrites: {
      '/index.html': '/'
    },
    nexts: [
      '/@react-refresh',
      '/@id/vite/modulepreload-polyfill',
      '/@vite/client'
    ],
    
  }
}