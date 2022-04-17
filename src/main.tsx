import React from 'react';
import { createRoot } from 'react-dom/client';
import { createServer, CokaHashChangeMode, dynamic } from '@coka/coka';

const app = createRoot(document.getElementById('root'));
const { Browser, createPathRule } = createServer(CokaHashChangeMode);

// createService(DemoExample);
createPathRule('/', dynamic(() => import('./comp'), <span>loading</span>));

app.render(<Browser>404 Not Found</Browser>);