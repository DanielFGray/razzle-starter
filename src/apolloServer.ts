import { ApolloServer, makeExecutableSchema } from 'apollo-server-express'
import { GraphQLError } from 'graphql'
import typeDefs from './graphql-schema.gql'
import type { Message, Resolvers } from './generated-types'

type ApolloContext = {
  session: null
}

let messageIdx = 0
const messages: Message[] = []

const resolvers: Resolvers<ApolloContext> = {
  Query: {
    MessageList(_parent, _variables, _context) {
      return messages
    },
  },
  Mutation: {
    MessageSend(_parent, variables, _context) {
      if (! variables?.message) throw new GraphQLError('missing message field')
      const message = {...variables.message, id: messageIdx++, createdAt: new Date().toISOString()}
      messages.unshift(message)
      return message
    },
  },
}

export const schema = makeExecutableSchema({ typeDefs, resolvers })

export const apolloServer = new ApolloServer({
  schema,
  context(_req): ApolloContext {
    return { session: null }
  },
})
