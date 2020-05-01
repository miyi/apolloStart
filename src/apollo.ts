import express, { Request, Response } from 'express'
import { ApolloServer, gql, IResolvers } from 'apollo-server-express'

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
  }
`

// Provide resolver functions for your schema fields
const resolvers: IResolvers = {
  Query: {
    hello: () => 'Hello world!',
    url: (_: void, __: void, context: any) => {
      return context.url
    },
  },
}

const graphqlServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }: ContextIntegration) => ({
    url: req.host + '://' + req.get('host'),
  }),
})

const app = express()
graphqlServer.applyMiddleware({ app, path: '/graphql' })

let server = app.listen(3000, 'localhost', () => {
  console.log('Listening on port: ', server.address() as AddressInfo)
})
