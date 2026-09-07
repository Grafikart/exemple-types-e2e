import { createServerFn } from '@tanstack/react-start'
import { UserRepository } from '@demo/repositories'
import { z } from 'zod'

const users = new UserRepository()
const userIdSchema = z.string().trim().min(1, 'Un identifiant est requis.')
const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Un nom est requis.'),
  email: z.email('Saisissez une adresse email valide.'),
})

export const listUsers = createServerFn({ method: 'GET' }).handler(() => users.findAll())

export const getUser = createServerFn({ method: 'GET' })
  .validator(userIdSchema)
  .handler(({ data }) => users.find(data))

export const createUser = createServerFn({ method: 'POST' })
  .validator(createUserSchema)
  .handler(({ data }) => users.create(data))
