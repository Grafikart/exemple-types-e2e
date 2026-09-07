import { GraphQLError, GraphQLScalarType, Kind } from 'graphql'
import { createSchema } from 'graphql-yoga'
import { z } from 'zod'
import type { Context } from './context'
import type { Resolvers } from './generated/resolvers-types'

const typeDefs = await Bun.file(new URL('../../schema.graphql', import.meta.url)).text()

const createUserInput = z.object({
  name: z.string().trim().min(1, 'Le nom est requis.'),
  email: z.string().trim().email('L’adresse email est invalide.'),
})

function inputError(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } })
}

function notFound(resource: string): never {
  throw new GraphQLError(`${resource} introuvable.`, { extensions: { code: 'NOT_FOUND' } })
}

function requiredId(id: string): string {
  const normalized = id.trim()
  return normalized.length > 0 ? normalized : inputError('L’identifiant est requis.')
}

export const resolvers: Resolvers = {
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    serialize: (value) => {
      if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new GraphQLError('DateTime invalide.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } })
      }
      return value.toISOString()
    },
    parseValue: () => inputError('DateTime ne peut pas être fourni en entrée.'),
    parseLiteral: (node) => node.kind === Kind.STRING
      ? inputError('DateTime ne peut pas être fourni en entrée.')
      : inputError('DateTime invalide.'),
  }),
  Query: {
    users: (_parent, _args, context) => context.users.findAll(),
    user: (_parent, { id }, context) => context.users.find(requiredId(id)) ?? notFound('Utilisateur'),
    post: (_parent, { id }, context) => context.posts.find(requiredId(id)) ?? notFound('Publication'),
  },
  Mutation: {
    createUser: (_parent, { input }, context) => {
      const parsed = createUserInput.safeParse(input)
      if (!parsed.success) inputError(parsed.error.issues[0]?.message ?? 'Entrée invalide.')
      return context.users.create(parsed.data)
    },
  },
  User: {
    posts: (user, _args, context) => context.posts.findAllByUserId(user.id),
  },
  Post: {
    author: (post, _args, context) => context.users.find(post.userId) ?? notFound('Utilisateur'),
  },
}

export const schema = createSchema<Context>({ typeDefs, resolvers })
