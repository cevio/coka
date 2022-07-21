import { loadConfigs } from './config';
import { resolve } from 'path';
import { existsSync } from 'fs';

export interface THeaderScript {
  type?: string,
  crossOrigin?: 'anonymous' | 'use-credentials',
  src: string,
}

export interface TAssets {
  headerScripts?: (string | THeaderScript)[],
  headerPreloadScripts?: string[],
  headerCsses?: string[],
  bodyScripts?: (string | THeaderScript)[],
}

const configs = loadConfigs();

export function getDevAssets(): TAssets {
  return {
    headerScripts: [
      {
        type: 'module',
        src: configs.input.client,
      }
    ]
  }
}

export function getProdAssets(): TAssets {
  const headerScripts: THeaderScript[] = [];
  const headerPreloadScripts: string[] = [];
  const headerCsses: string[] = [];
  const cwd = process.cwd();
  const clientDir = resolve(cwd, configs.output.client.startsWith('/') ? '.' + configs.output.client : configs.output.client);
  if (!existsSync(clientDir)) throw new Error('miss client output dictionary');
  const manifest_file = resolve(clientDir, 'manifest.json');
  if (!existsSync(manifest_file)) throw new Error('miss client manifest.json');
  const manifest = require(manifest_file);
  const file = configs.input.client.startsWith('/') ? configs.input.client.substring(1) : configs.input.client;
  if (!manifest[file]) throw new Error('Not Found');
  headerScripts.push({
    type: 'module',
    crossOrigin: 'anonymous',
    src: manifest[file].file.startsWith('/') ? manifest[file].file : '/' + manifest[file].file,
  });
  const imports = manifest[file].imports || [];
  headerPreloadScripts.push(...imports.map((s: string) => {
    if (manifest[s]) {
      return manifest[s].file.startsWith('/') ? manifest[s].file : '/' + manifest[s].file;
    }
  }).filter(Boolean));
  const csses = manifest[file].css || [];
  headerCsses.push(...csses.map((c: string) => {
    return c.startsWith('/') ? c : '/' + c;
  }))
  return {
    headerScripts,
    headerPreloadScripts,
    headerCsses,
  }
}