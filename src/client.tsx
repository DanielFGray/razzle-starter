import React from 'react'
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloLink } from '@apollo/client/link/core'
import { onError } from '@apollo/client/link/error'
import { HttpLink } from '@apollo/client/link/http'
import { ApolloProvider } from '@apollo/client/react'
import App from './App'

document.addEventListener('DOMContentLoaded', () => {
  let initData = {}
  try {
    initData = JSON.parse(document.getElementById('__INIT_DATA__')!.textContent as string)
  } catch (e) { console.error('failed to unserialize cache: %o', e) }
  const apolloClient = new ApolloClient({
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.error(
              `[GraphQL error]: message: ${message}, location: ${JSON.stringify(
                locations,
              )}, path: ${JSON.stringify(path)}`,
            ),
          )
        if (networkError) console.error(`[Network error]: ${networkError}`)
      }),
      new HttpLink({
        uri: '/graphql',
        credentials: 'include',
        headers: {
          // 'CSRF-Token': initData.CSRF_TOKEN,
        },
      }),
    ]),
    cache: new InMemoryCache().restore(initData),
  })
  hydrate(
    <ApolloProvider client={apolloClient}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </ApolloProvider>,
    document.getElementById('root'),
  )
})

if (module.hot) {
  module.hot.accept()
}
