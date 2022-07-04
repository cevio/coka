import { IncomingMessage, ServerResponse } from 'http';
const express = require('express')
const { createServer: createViteServer } = require('vite')
const serveStatic = require('serve-static');

async function createServer() {
  const app = express()
  app.use((req: IncomingMessage, res: ServerResponse, next: Function) => {
    
    if (req.url === '/src/favicon.svg') {
      return res.end()
    }
    next();
  })
  const vite = await createViteServer({
    server: { 
      middlewareMode: 'ssr',
    }
  })
  // vite.config.plugins.push()
  app.use(vite.middlewares)
  // app.use((req, res, next) => {
  //   if (req.url.endsWith('.html')) return next();
  //   serveStatic('dist/client')(req, res, next);
  // })
  app.use('*', async (req, res) => {
    try {
      console.log(req)
      const render = await vite.ssrLoadModule('/src/server.tsx')
      render.default(req, res)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      console.error(e)
      res.status(500).end(e.message)
    }
  })

  app.listen(3001, () => {
    console.log('on 3000')
  })
}

createServer()