import { createServerFn } from '@tanstack/react-start'
import { PostRepository, UserRepository } from '@demo/repositories'
import { z } from 'zod'

const posts = new PostRepository()
const users = new UserRepository()
const idSchema = z.string().trim().min(1, 'Un identifiant est requis.')

export const getPost = createServerFn({ method: 'GET' })
  .validator(idSchema)
  .handler(({ data }) => posts.find(data))

export const listPostsByUser = createServerFn({ method: 'GET' })
  .validator(idSchema)
  .handler(({ data }) => users.find(data) ? posts.findAllByUserId(data) : undefined)
