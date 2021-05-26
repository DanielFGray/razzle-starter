import { ApolloServer, makeExecutableSchema } from 'apollo-server-express'
import { GraphQLError } from 'graphql'
import typeDefs from './graphql-schema.gql'
import type { Message, Resolvers } from './generated-types'

type ApolloContext = {
  session: null
}

const messages: Message[] = []

const resolvers: Resolvers<ApolloContext> = {
  Query: {
    MessageList(_parent, _variables, _context) {
      return messages
    },
  },
  Mutation: {
    MessageSend(_parent, variables, _context) {
      try {
        if (! variables?.message) throw new GraphQLError('missing message field')
        messages.push(variables.message)
        return { code: '200', success: true, message: 'added' }
      } catch (e) {
        return { code: '400', success: false, message: e?.message as string }
      }
    },
  },
  MutationResponse: {
    __resolveType(_mutationResponse, _context, _info) {
      return null
    },
  },
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export const apolloServer = new ApolloServer({
  schema,
  context(_req): ApolloContext {
    return { session: null }
  },
})
