import express, { Request, Response } from 'express'
import { ApolloServer, gql, IResolvers } from 'apollo-server-express'
// import cors from 'cors'
import session from 'express-session'
import { createClient } from 'redis'
import connectRedis from 'connect-redis'

const SESSION_SECRET = 'secretsecret'

interface AddressInfo {
  address: string
  family: string
  port: number
}

interface ContextIntegration {
  req: Request
  res: Response
}

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
      return context.session.req.session.dummy1
    },
    readSessionDummy2: (_: void, __: void, context: any) => {
      return context.session.req.session.dummy2
    },
  },
  Mutation: {
    setSessionDummy1: (_: void, __: void, context: any) => {
      context.session.req.session.dummy1 = true
      return 'dummy1 set'
    },
    setSessionDummy2: (_: void, __: void, context: any) => {
      context.session.req.session.dummy2 = true
      return 'dummy2 set'
    },
  },
}

const graphqlServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }: ContextIntegration) => ({
    url: req.get('host'),
    session: { req, res },
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

let httpServer = app.listen(3000, 'localhost', () => {
  console.log('Listening on port: ', httpServer.address() as AddressInfo)
})
