// https://www.typescriptlang.org/docs/handbook/modules.html#ambient-modules

declare module '*.gql' {
  import { DocumentNode } from 'graphql'
  const Schema: DocumentNode

  export = Schema
}

declare module '*.svg' {
  const src: string
  export default src
}
