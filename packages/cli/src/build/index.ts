import { createViteBuilder } from './vite';
export default async function createBuilder(options: { type: 'vite' | 'webpack', mode: 'web' | 'client' | 'server' }) {
  if (options.type === 'vite') {
    await createViteBuilder(options.mode);
  }
}