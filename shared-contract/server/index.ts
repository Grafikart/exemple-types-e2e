import { fetchRequestHandler } from '@ts-rest/serverless/fetch'
import { contract } from '@demo/shared-contract'
import { router } from './router'

const server = Bun.serve({
  port: 3100,
  fetch: (request) => fetchRequestHandler({ request, contract, router, options: {} }),
})

console.log(`Shared-contract server listening on ${server.url}`)
