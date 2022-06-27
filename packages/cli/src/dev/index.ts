import { createViteDevServer } from './vite';

export default async function createDevServer(options: { type: 'vite' | 'webpack', mode: 'web' | 'ssr' }) {
  if (options.type === 'vite') {
    await createViteDevServer(options.mode);
  } else {
    console.log('unsupported platform.');
  }
}