import React, { lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createServer, CokaHashChangeMode, dynamic } from '../packages/coka/src';

const app = createRoot(document.getElementById('root'));
const { Browser, createPathRule } = createServer(CokaHashChangeMode);

// createService(DemoExample);
createPathRule('/', dynamic(() => import('./comp'), <span>loading</span>));

app.render(<Browser>404 Not Found</Browser>);