import React from 'react';
import { createRoot } from 'react-dom/client';
import { createServer, CokaHashChangeMode } from '../packages/coka/src';
import createRouter from './router';
const app = createRoot(document.getElementById('root'));
const application = createServer(CokaHashChangeMode);
const Browser = application.Browser;
createRouter(application);
app.render(<Browser>404 Not Found</Browser>);
console.log(1)