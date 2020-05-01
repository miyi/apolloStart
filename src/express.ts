import express from 'express'

interface AddressInfo {
	address: string,
	family: string,
	port: number,
}

const app = express()
app.get('/', (_,res) => {
  res.send('Hello blog reader!')
})

let server = app.listen(3000, 'localhost', () => {
	console.log('Listening on port: ', server.address() as AddressInfo)
})

