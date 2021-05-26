import fs from 'fs'
import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, StaticRouterContext } from 'react-router'
import { HelmetProvider, FilledContext } from 'react-helmet-async'
import App from './App'

interface Assets {
  [entrypoint: string]: { [asset: string]: ReadonlyArray<string> }
}

const RAZZLE_ASSETS_MANIFEST = process.env.RAZZLE_ASSETS_MANIFEST
if (! RAZZLE_ASSETS_MANIFEST) throw new ReferenceError('undefined env var RAZZLE_ASSETS_MANIFEST')
const assets: Assets = JSON.parse(fs.readFileSync(RAZZLE_ASSETS_MANIFEST, 'utf8'))

function cssLinksFromAssets(entrypoint: string) {
  return (
    assets[entrypoint]?.css
      ?.map(asset => `<link rel="stylesheet" href="${asset}" type="text/css">`)
      .join('') ?? ''
  )
}

function jsScriptTagsFromAssets(entrypoint: string, extra = '') {
  return (
    assets[entrypoint]?.js
      ?.map(asset => `<script src="${asset}" type="text/javascript"${extra}></script>`)
      .join('') ?? ''
  )
}

export function render(
  req: express.Request,
  res: express.Response,
):
  | {
      type: 'html'
      status: number
      html: string
    }
  | {
      type: 'redirect'
      status: number
      redirect: string
    } {
  const routerCtx: StaticRouterContext = {}
  const helmetCtx = {}
  const status = 200

  const Init = (
    <StaticRouter location={req.url} context={routerCtx}>
      <HelmetProvider context={helmetCtx}>
        <App />
      </HelmetProvider>
    </StaticRouter>
  )

  const markup = renderToString(Init)
  const { helmet } = helmetCtx as FilledContext

  if (routerCtx.url)
    return {
      type: 'redirect',
      status: routerCtx.statusCode ?? 302,
      redirect: routerCtx.url,
    }

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

  return { type: 'html', status, html }
}

export function SSR(req: express.Request, res: express.Response): void {
  const renderRes = render(req, res)
  switch (renderRes.type) {
  case 'redirect':
    res.redirect(renderRes.status, renderRes.redirect)
    return
  case 'html':
    res.status(renderRes.status)
    res.send(renderRes.html)
    return
  }
}
