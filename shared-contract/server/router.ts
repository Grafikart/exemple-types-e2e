import { contract } from '@demo/shared-contract'
import { tsr } from '@ts-rest/serverless/fetch'
import { UserRepository } from '@demo/repositories'

const users = new UserRepository()

function toUserResponse(user: ReturnType<UserRepository['findAll']>[number]) {
  return { ...user, createdAt: user.createdAt.toISOString() }
}

export const router = tsr.router(contract, {
  users: {
    list: async () => ({ status: 200, body: users.findAll().map(toUserResponse) }),
    find: async ({ params }) => {
      const user = users.find(params.id)
      return user
        ? { status: 200, body: toUserResponse(user) }
        : { status: 404, body: { message: 'User not found' } }
    },
    create: async ({ body }) => ({ status: 201, body: toUserResponse(users.create(body)) }),
    update: async ({ params, body }) => {
      const user = users.update(params.id, body)
      return user
        ? { status: 200, body: toUserResponse(user) }
        : { status: 404, body: { message: 'User not found' } }
    },
    delete: async ({ params }) => {
      const user = users.delete(params.id)
      return user
        ? { status: 200, body: toUserResponse(user) }
        : { status: 404, body: { message: 'User not found' } }
    },
  },
})
