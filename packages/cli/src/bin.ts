#!/usr/bin/env node

import { Command } from 'commander';
import createDevServer from './dev';
import createBuilder from './build';
import createStarter from './start';

const program = new Command();
const { name, version, description } = require('../package.json');

program
  .name(name)
  .description(description)
  .version(version, '-v, --version', 'output the current version');

program
  .command('dev')
  .requiredOption('-t, --type <type>', 'type of using which between `vite` and `webpack`', 'vite')
  .requiredOption('-m, --mode <mode>', 'build project assets by mode of `web` or `ssr`. Default is `web`', 'web')
  .description('start dev server')
  .action(createDevServer);

program
  .command('build')
  .requiredOption('-t, --type <type>', 'type of using which between `vite` and `webpack`', 'vite')
  .requiredOption('-m, --mode <mode>', 'build project assets by mode of `web` `client` or `server`. Default is `web`', 'web')
  .description('start building')
  .action(createBuilder);

program
  .command('start <port>')
  .description('start production server')
  .action(createStarter)

program.parseAsync();