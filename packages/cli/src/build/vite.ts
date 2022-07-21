import { build, PluginOption, UserConfig, Plugin } from 'vite';
import { loadConfigs } from '../config';
import { TConfigs } from '../types';
import { buildHTML } from '../html';
import { getProdAssets } from '../assets';
import { resolve } from 'path';
import { existsSync, writeFileSync } from 'fs';

export async function createViteBuilder(mode: 'web' | 'client' | 'server') {
  const configs = loadConfigs();
  if (mode === 'web') await buildHTML(configs);
  await build({
    define: {
      WINDOW_NAMESPACE: JSON.stringify(configs.namespace.window),
    },
    plugins: [
      createViteBuilderPlugin(mode, configs),
    ]
  })
  if (mode === 'client') {
    const pkgfile = resolve(process.cwd(), 'package.json');
    if (existsSync(pkgfile)) {
      const pkg = require(pkgfile);
      const assets = getProdAssets();
      pkg.assets = assets;
      writeFileSync(pkgfile, JSON.stringify(pkg, null, 2), 'utf8');
    }
  }
}

function createViteBuilderPlugin(mode: 'web' | 'client' | 'server', configs: TConfigs) {
  return Object.assign(
    {
      name: 'vite:coka:build',
      apply: 'build',
    }, 
    mode === 'web'
      ? createViteWebBuild(configs)
      : mode === 'client'
        ? createViteClientBuild(configs)
        : createViteServerBuild(configs)
  ) as PluginOption
}

function createViteWebBuild(options: TConfigs): Omit<Plugin, 'name' | 'apply'> {
  return {
    config(configs) {
      configs.build.outDir = options.output.web;
    }
  }
}

function createViteClientBuild(options: TConfigs): Omit<Plugin, 'name' | 'apply'> {
  return {
    config(configs: UserConfig) {
      configs.build.outDir = options.output.client;
      configs.build.manifest = true;
      if (!configs.build.rollupOptions) configs.build.rollupOptions = {};
      if (!configs.build.rollupOptions.input) configs.build.rollupOptions.input = {};
      configs.build.rollupOptions.input = {
        [options.namespace.file]: options.input.client,
      }
    }
  }
}

function createViteServerBuild(options: TConfigs): Omit<Plugin, 'name' | 'apply'> {
  return {
    config(configs: UserConfig) {
      configs.build.outDir = options.output.server;
      configs.build.ssr = options.input.server;
      if (configs.build.rollupOptions?.manualChunks) {
        delete configs.build.rollupOptions.manualChunks;
      }
    }
  }
}