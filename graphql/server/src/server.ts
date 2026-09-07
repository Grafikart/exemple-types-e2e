import { createYoga } from 'graphql-yoga'
import { createContext } from './context'
import { schema } from './schema'

export const yoga = createYoga({
  graphqlEndpoint: '/graphql',
  schema,
  context: createContext,
})
