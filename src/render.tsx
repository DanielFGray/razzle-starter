import fs from 'fs'
import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, StaticRouterContext } from 'react-router'
import { HelmetProvider, FilledContext } from 'react-helmet-async'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloLink } from '@apollo/client/link/core'
import { onError } from '@apollo/client/link/error'
import { SchemaLink } from '@apollo/client/link/schema'
import { ApolloProvider } from '@apollo/client/react'
import {getDataFromTree} from '@apollo/client/react/ssr'
import App from './App'
import { schema } from './apolloServer'

interface Assets {
  [entrypoint: string]: { [asset: string]: ReadonlyArray<string> }
}

const RAZZLE_ASSETS_MANIFEST = process.env.RAZZLE_ASSETS_MANIFEST
if (!RAZZLE_ASSETS_MANIFEST)
  throw new ReferenceError('undefined env var RAZZLE_ASSETS_MANIFEST')
const assets: Assets = JSON.parse(
  fs.readFileSync(RAZZLE_ASSETS_MANIFEST, 'utf8'),
)

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

const serverLink = ApolloLink.from([
  onError(({ networkError, graphQLErrors }) => {
    if (graphQLErrors) console.error(...graphQLErrors)
    if (networkError) console.error(networkError)
  }),
  new SchemaLink({ schema }),
])

export async function render(
  req: express.Request,
  res: express.Response,
): Promise<
  | {
      type: 'html'
      status: number
      html: string
    }
  | {
      type: 'redirect'
      status: number
      redirect: string
    }
> {
  const routerCtx: StaticRouterContext = {}
  const helmetCtx = {}
  const status = 200
  const apolloClient = new ApolloClient({
    ssrMode: true,
    link: serverLink,
    cache: new InMemoryCache(),
  })
  const Init = (
    <ApolloProvider client={apolloClient}>
      <StaticRouter location={req.url} context={routerCtx}>
        <HelmetProvider context={helmetCtx}>
          <App />
        </HelmetProvider>
      </StaticRouter>
    </ApolloProvider>
  )

  const markup = await getDataFromTree(Init)
  const { helmet } = helmetCtx as FilledContext
  const data = apolloClient.extract()

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
    <script id="__INIT_DATA__"  type="application/json">${JSON.stringify(data).replace('<', '&lt;')}</script>
    ${jsScriptTagsFromAssets('client', ' defer crossorigin')}
  </body>
</html>`

  return { type: 'html', status, html }
}

export function SSR(req: express.Request, res: express.Response): void {
  void render(req, res).then(renderRes => {
    switch (renderRes.type) {
    case 'redirect':
      res.redirect(renderRes.status, renderRes.redirect)
      return
    case 'html':
      res.status(renderRes.status)
      res.send(renderRes.html)
      return
    }
  })
}
