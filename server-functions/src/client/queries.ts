import { queryOptions } from '@tanstack/react-query'
import { getPost, listPostsByUser } from '~/server/posts.functions'
import { getUser, listUsers } from '~/server/users.functions'

export const usersQueryOptions = () => queryOptions({
  queryKey: ['users'],
  queryFn: () => listUsers(),
})

export const userQueryOptions = (id: string) => queryOptions({
  queryKey: ['users', id],
  queryFn: () => getUser({ data: id }),
})

export const userPostsQueryOptions = (id: string) => queryOptions({
  queryKey: ['users', id, 'posts'],
  queryFn: () => listPostsByUser({ data: id }),
})

export const postQueryOptions = (id: string) => queryOptions({
  queryKey: ['posts', id],
  queryFn: () => getPost({ data: id }),
})
