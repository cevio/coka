import { UserConfig } from 'vite';
export interface TBuildConfigs {
  clientEntryFile: string,
  serverEntryFile: string,
  scriptBootstrapNamespace: string,
  clientDir: string,
  serverDir: string,
  ssrManifest?: boolean,
}
export function createCokaBuildServer(options: TBuildConfigs) {
  return {
    name: 'vite:coka:build',
    apply: 'build',
    config(configs: UserConfig) {
      if (!configs.build) configs.build = {};
      const isSSR = !!configs.build.ssr;
      if (!isSSR) {
        configs.build.outDir = options.clientDir;
        if (!configs.build.rollupOptions) configs.build.rollupOptions = {};
        if (!configs.build.rollupOptions.input) configs.build.rollupOptions.input = {};
        configs.build.rollupOptions.input = {
          [options.scriptBootstrapNamespace]: options.clientEntryFile,
        }
      } else {
        configs.build.outDir = options.serverDir;
        configs.build.ssr = options.serverEntryFile;
        configs.build.ssrManifest = !!options.ssrManifest;
        if (configs.build.rollupOptions?.manualChunks) {
          delete configs.build.rollupOptions.manualChunks;
        }
      }
    }
  }
}