import { expect, test } from 'bun:test'
import { app } from './app'

const request = (path: string) => app.request(`http://demo.local${path}`)

test('the OpenAPI document describes the four read operations', async () => {
  const response = await request('/openapi')
  const document = await response.json() as { openapi: string; paths: Record<string, unknown> }

  expect(response.status).toBe(200)
  expect(document.openapi).toStartWith('3.')
  expect(Object.keys(document.paths)).toEqual([
    '/api/users',
    '/api/users/{id}',
    '/api/users/{id}/posts',
    '/api/posts/{id}',
  ])
})

test('the API returns stable data and expected not-found responses', async () => {
  const list = await request('/api/users')
  const users = await list.json() as Array<{ id: string; createdAt: string }>
  expect(users).toHaveLength(10)
  expect(new Date(users[0]!.createdAt).toISOString()).toBe(users[0]!.createdAt)

  const posts = await request(`/api/users/${users[0]!.id}/posts`)
  expect(await posts.json()).toEqual([])

  const missing = await request('/api/posts/not-found')
  expect(missing.status).toBe(404)
  expect(await missing.json()).toEqual({ message: 'Publication introuvable.' })
})

test('the API creates a user and rejects invalid input', async () => {
  const created = await app.request('http://demo.local/api/users', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Alice Martin', email: 'alice@example.com' }),
  })
  expect(created.status).toBe(201)
  expect((await created.json() as { email: string }).email).toBe('alice@example.com')

  const invalid = await app.request('http://demo.local/api/users', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '', email: 'invalid' }),
  })
  expect(invalid.status).toBe(400)
})
