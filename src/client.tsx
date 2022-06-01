import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createServer, CokaPopStateMode } from '../packages/coka/src';
import createRouter from './router';

// Bootstrap logic code:
const application = createServer(CokaPopStateMode);
const Client = application.Client;
const element = document.getElementById('root');
createRouter(application);
hydrateRoot(
  element,
  <Client>404 Not Found</Client>
);