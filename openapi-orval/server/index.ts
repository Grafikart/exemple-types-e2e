import { app } from './app'

const server = Bun.serve({ port: 3201, fetch: app.fetch })

console.log(`OpenAPI server listening on ${server.url}`)
