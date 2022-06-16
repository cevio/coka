import { createCokaDevServer, TDevConfigs } from './dev';
import { createCokaBuildServer, TBuildConfigs } from './build';
import { PluginOption } from 'vite';

export default function createCokaServer(options: TDevConfigs & TBuildConfigs) {
  if (!options.serverEntryFile) options.serverEntryFile = '/src/entry-server.tsx';
  if (!options.clientEntryFile) options.clientEntryFile = '/src/entry-client.tsx';
  if (!options.rewrites) options.rewrites = { '/index.html': '/' };
  if (!options.scriptBootstrapNamespace) options.scriptBootstrapNamespace = 'index';
  if (!options.clientDir) options.clientDir = 'dist/client';
  if (!options.serverDir) options.serverDir = 'dist/server';
  return [
    createCokaDevServer({
      serverEntryFile: options.serverEntryFile,
      rewrites: options.rewrites,
    }),
    createCokaBuildServer({
      clientDir: options.clientDir,
      clientEntryFile: options.clientEntryFile,
      serverDir: options.serverDir,
      serverEntryFile: options.serverEntryFile,
      scriptBootstrapNamespace: options.scriptBootstrapNamespace,
      ssrManifest: options.ssrManifest,
    })
  ] as PluginOption;
}