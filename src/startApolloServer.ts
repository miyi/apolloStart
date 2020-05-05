import express from 'express'
import { ApolloServer, gql, IResolvers } from 'apollo-server-express'
// import cors from 'cors'
import session from 'express-session'
import { createClient } from 'redis'
import connectRedis from 'connect-redis'
import { ContextIntegration } from './types/server-utils'

const SESSION_SECRET = 'secretsecret'

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
    url: String
    readSessionDummy1: String
    readSessionDummy2: String
  }

  type Mutation {
    setSessionDummy1: String
    setSessionDummy2: String
  }
`

// Provide resolver functions for your schema fields
const resolvers: IResolvers = {
  Query: {
    hello: () => 'Hello world!',
    url: (_: void, __: void, context: any) => {
      return context.url
    },
    readSessionDummy1: (_: void, __: void, context: any) => {
      return context.session.dummy1
    },
    readSessionDummy2: (_: void, __: void, context: any) => {
      return context.session.dummy2
    },
  },
  Mutation: {
    setSessionDummy1: (_: void, __: void, context: any) => {
      context.session.dummy1 = true
      return 'dummy1 set'
    },
    setSessionDummy2: (_: void, __: void, context: any) => {
      context.session.dummy2 = true
      return 'dummy2 set'
    },
  },
}

export const ApolloExpressServer = () => {
  const graphqlServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }: ContextIntegration) => ({
      url: req.get('host'),
      session: req.session,
    }),
    playground: {
      settings: {
        'request.credentials': 'include',
      },
    },
  })

  const RedisClient = createClient()
  const RedisStore = connectRedis(session)

  const app = express()
  app.use(
    session({
      store: new RedisStore({
        client: RedisClient as any,
      }),
      name: 'qid',
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: false,
        sameSite: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  )

  const corsOptions = { credentials: true, origin: '*' }
  graphqlServer.applyMiddleware({ app, cors: corsOptions, path: '/graphql' })

  return app
}
