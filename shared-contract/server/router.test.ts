import { expect, test } from 'bun:test'
import { fetchRequestHandler } from '@ts-rest/serverless/fetch'
import { contract } from '@demo/shared-contract'
import { router } from './router'

async function request(path: string, init?: RequestInit) {
  return fetchRequestHandler({
    request: new Request(`http://demo.local${path}`, init),
    contract,
    router,
    options: {},
  })
}

test('REST contract lists and creates users', async () => {
  const before = await request('/users')
  expect(before.status).toBe(200)
  const initialUsers = await before.json() as Array<{ id: string }>

  const created = await request('/users', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Alice Martin', email: 'alice@example.com' }),
  })
  expect(created.status).toBe(201)
  const user = await created.json() as { id: string; createdAt: string }
  expect(user.id).toBeString()
  expect(new Date(user.createdAt).toISOString()).toBe(user.createdAt)

  const after = await request('/users')
  const users = await after.json() as Array<{ id: string }>
  expect(users).toHaveLength(initialUsers.length + 1)
  expect(users.some((item) => item.id === user.id)).toBeTrue()
})

test('REST contract rejects invalid create input', async () => {
  const response = await request('/users', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '', email: 'not-an-email' }),
  })
  expect(response.status).toBe(400)
  const error = await response.json() as {
    bodyErrors?: { issues: Array<{ path: string[]; message: string }> }
  }
  expect(error.bodyErrors?.issues.map(({ path, message }) => ({ path, message }))).toEqual([
    { path: ['name'], message: 'Le nom est requis.' },
    { path: ['email'], message: 'L’adresse email est invalide.' },
  ])
})
