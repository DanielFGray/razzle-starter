import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, StaticRouterContext } from 'react-router'
import { HelmetProvider, FilledContext } from 'react-helmet-async'

import App from './App'

interface Assets {
  [entrypoint: string]: { [asset: string]: ReadonlyArray<string> }
}

const assets: Assets = require(process.env.RAZZLE_ASSETS_MANIFEST!)

function cssLinksFromAssets(entrypoint: string) {
  return assets[entrypoint]?.css
    ?.map(asset => `<link rel="stylesheet" href="${asset}" type="text/css">`)
    .join('') ?? ''
}

function jsScriptTagsFromAssets(entrypoint: string, extra = '') {
  return assets[entrypoint]?.js
    ?.map(asset => `<script src="${asset}" type="text/javascript"${extra}></script>`)
    .join('') ?? ''
}

export function renderApp(req: express.Request, res: express.Response) {
  const routerCtx: StaticRouterContext = {}
  const helmetCtx = {}

  const Init = (
    <StaticRouter location={req.url} context={routerCtx}>
      <HelmetProvider context={helmetCtx}>
        <App />
      </HelmetProvider>
    </StaticRouter>
  )

  const markup = renderToString(Init)
  const { helmet } = helmetCtx as FilledContext

  if (routerCtx.url) return { redirect: routerCtx.url }

  // prettier-ignore
  const html = `<!doctype html>
<html ${helmet.htmlAttributes.toString()}>
  <head>
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.style.toString()}
    ${helmet.link.toString()}
    ${cssLinksFromAssets('client')}
  </head>
  <body${helmet.bodyAttributes.toString()}>
    ${helmet.noscript.toString()}
    <div id="root">${markup}</div>
    ${jsScriptTagsFromAssets('client', ' defer crossorigin')}
  </body>
</html>`

  return { html }
}

const app = express()
app.disable('x-powered-by')
app.use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
app.get('/*', (req: express.Request, res: express.Response) => {
  const { html = '', redirect = false } = renderApp(req, res)
  if (redirect) {
    res.redirect(redirect)
  } else {
    res.send(html)
  }
})

export default app
