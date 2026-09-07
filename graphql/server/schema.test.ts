import { expect, test } from 'bun:test'
import { yoga } from './src/server'

const execute = async (query: string, variables?: Record<string, unknown>) => {
  const response = await yoga.fetch(new Request('http://demo.local/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }))
  return response.json() as Promise<{ data?: unknown; errors?: Array<{ extensions: { code?: string } }> }>
}

test('reads users and serializes dates as ISO strings', async () => {
  const result = await execute('{ users { id name createdAt posts { id author { id } } } }')
  expect(result.errors).toBeUndefined()
  const users = (result.data as { users: Array<{ id: string; createdAt: string; posts: Array<{ author: { id: string } }> }> }).users
  expect(users).toHaveLength(10)
  expect(new Date(users[0]!.createdAt).toISOString()).toBe(users[0]!.createdAt)
  expect(users[0]!.posts).toEqual([])
  expect(users[1]!.posts[0]?.author.id).toBe(users[1]!.id)
})

test('creates a user from a GraphQL input object', async () => {
  const result = await execute(
    'mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { name email } }',
    { input: { name: ' Alice Martin ', email: 'alice@example.com' } },
  )
  expect(result.errors).toBeUndefined()
  expect(result.data).toEqual({ createUser: { name: 'Alice Martin', email: 'alice@example.com' } })
})

test('reports validation and missing resources with explicit error codes', async () => {
  const invalid = await execute(
    'mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id } }',
    { input: { name: ' ', email: 'invalid' } },
  )
  expect(invalid.errors?.[0]?.extensions.code).toBe('BAD_USER_INPUT')

  const missing = await execute('{ user(id: "missing") { id } }')
  expect(missing.errors?.[0]?.extensions.code).toBe('NOT_FOUND')
})
