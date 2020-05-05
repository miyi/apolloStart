import { ApolloExpressServer } from './startApolloServer';

ApolloExpressServer().listen(3000, 'localhost', () => {
	console.log(`server listening on port 3000`)
})

