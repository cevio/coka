import { sync } from '@stdlib/fs-resolve-parent-path';
import { createServer } from 'vite';
import { TConfigs } from './types';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const nodeModulesDictionary = sync('node_modules', { dir: process.cwd() });

export const templatePath = resolve(nodeModulesDictionary, '../index.html');
export async function buildHTML(configs: TConfigs) {
  if (!nodeModulesDictionary) throw new Error('You should install deps first');
  const server = await createServer();
  const render = await server.ssrLoadModule(configs.input.html);
  const htmlComponent = render.default;
  const html = renderToStaticMarkup(createElement(htmlComponent, {
    bodyScripts: [
      {
        src: configs.input.web,
        type: 'module'
      }
    ],
  }))
  writeFileSync(templatePath, html, 'utf8');
  await server.close();
}
export function cleanHTML() {
  if (existsSync(templatePath)) {
    unlinkSync(templatePath);
  }
}