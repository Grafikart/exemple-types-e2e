import { yoga } from './src/server'

const server = Bun.serve({ port: 3300, fetch: yoga })

console.log(`GraphQL Yoga server listening on ${server.url}graphql`)
