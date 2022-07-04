import * as express from 'express';
import * as serveStatic from 'serve-static';
import { loadConfigs } from '../config';
import { existsSync } from 'fs';
import { resolve } from 'path';

export default async function createStarter(_port: string) {
  const configs = loadConfigs();
  const port = Number(_port);
  const cwd = process.cwd();
  const serverEntryFile = resolve(cwd, configs.output.server, 'entry-server.js');
  if (!existsSync(serverEntryFile)) throw new Error('miss server entry file');
  
  const serverEntry = require(serverEntryFile);
  const app = express();
  
  app.use(serveStatic(configs.output.client));
  app.get('*', (req, res, next) => serverEntry.default(req, res, next));

  app.listen(port, (err?: Error) => {
    if (err) return console.error(err);
    console.log('server start on port', port);
  })
}