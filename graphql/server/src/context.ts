import { PostRepository, UserRepository } from '@demo/repositories'

export type Context = {
  users: UserRepository
  posts: PostRepository
}

export const createContext = (): Context => ({
  users: new UserRepository(),
  posts: new PostRepository(),
})
