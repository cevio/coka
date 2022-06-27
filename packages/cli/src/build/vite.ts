import { build, PluginOption, UserConfig, Plugin, createServer } from 'vite';
import { loadConfigs } from '../config';
import { TConfigs } from '../types';
import { buildHTML } from '../html';

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