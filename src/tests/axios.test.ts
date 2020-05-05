import axios from 'axios'
import { ApolloExpressServer } from '../startApolloServer';
import { AddressInfo } from '../types/server-utils';
import { Server } from 'http';

let HOST_URL: string
let server: Server

const urlQuery = `
	{
		url
	}
`
beforeAll(async () => {
	server = await ApolloExpressServer().listen(0, 'localhost', () => {
		HOST_URL = 'http://127.0.0.1:' + (server.address() as AddressInfo).port + '/graphql'
		console.log(HOST_URL)
	})
});

afterAll(() => {
	server.close
})

describe('making requests with axios', () => {
	it('makes a url query call', async () => {
		const response = await axios.post(
			HOST_URL,
			{
				query: urlQuery
			},
			{
				withCredentials: true
			}
		).catch((error: any) => {
			console.log(error)
		})
		if (response) {
			expect(response.data.data.url).toEqual('127.0.0.1:3000')
		}		
	})
})