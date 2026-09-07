import { Hono } from 'hono'
import { describeRoute, openAPIRouteHandler, resolver, validator } from 'hono-openapi'
import { PostRepository, UserRepository } from '@demo/repositories'
import * as v from 'valibot'

const users = new UserRepository()
const posts = new PostRepository()

const idSchema = v.pipe(v.string(), v.minLength(1, 'L’identifiant est requis.'))
const createUserSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Le nom est requis.')),
  email: v.pipe(v.string(), v.email('L’adresse email est invalide.')),
})
const userSchema = v.object({
  id: v.string(),
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
})
const postSchema = v.object({
  id: v.string(),
  userId: v.string(),
  title: v.string(),
  body: v.string(),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
})
const errorSchema = v.object({ message: v.string() })

const toUser = (user: ReturnType<UserRepository['findAll']>[number]) => ({
  ...user,
  createdAt: user.createdAt.toISOString(),
})
const toPost = (post: ReturnType<PostRepository['findAll']>[number]) => ({
  ...post,
  createdAt: post.createdAt.toISOString(),
})

const notFound = (resource: string) => ({ message: `${resource} introuvable.` })

export const app = new Hono()

app.get(
  '/api/users',
  describeRoute({
    tags: ['Users'],
    summary: 'Lister les utilisateurs',
    responses: {
      200: { description: 'Liste des utilisateurs', content: { 'application/json': { schema: resolver(v.array(userSchema)) } } },
    },
  }),
  (c) => c.json(users.findAll().map(toUser)),
)

app.post(
  '/api/users',
  describeRoute({
    tags: ['Users'],
    summary: 'Créer un utilisateur',
    responses: {
      201: { description: 'Utilisateur créé', content: { 'application/json': { schema: resolver(userSchema) } } },
      400: { description: 'Entrée invalide' },
    },
  }),
  validator('json', createUserSchema),
  (c) => c.json(toUser(users.create(c.req.valid('json'))), 201),
)

app.get(
  '/api/users/:id',
  describeRoute({
    tags: ['Users'],
    summary: 'Consulter un utilisateur',
    responses: {
      200: { description: 'Utilisateur trouvé', content: { 'application/json': { schema: resolver(userSchema) } } },
      404: { description: 'Utilisateur introuvable', content: { 'application/json': { schema: resolver(errorSchema) } } },
    },
  }),
  validator('param', v.object({ id: idSchema })),
  (c) => {
    const user = users.find(c.req.valid('param').id)
    return user ? c.json(toUser(user)) : c.json(notFound('Utilisateur'), 404)
  },
)

app.get(
  '/api/users/:id/posts',
  describeRoute({
    tags: ['Posts'],
    summary: 'Lister les publications d’un utilisateur',
    responses: {
      200: { description: 'Publications de l’utilisateur', content: { 'application/json': { schema: resolver(v.array(postSchema)) } } },
      404: { description: 'Utilisateur introuvable', content: { 'application/json': { schema: resolver(errorSchema) } } },
    },
  }),
  validator('param', v.object({ id: idSchema })),
  (c) => {
    const id = c.req.valid('param').id
    return users.find(id)
      ? c.json(posts.findAllByUserId(id).map(toPost))
      : c.json(notFound('Utilisateur'), 404)
  },
)

app.get(
  '/api/posts/:id',
  describeRoute({
    tags: ['Posts'],
    summary: 'Consulter une publication',
    responses: {
      200: { description: 'Publication trouvée', content: { 'application/json': { schema: resolver(postSchema) } } },
      404: { description: 'Publication introuvable', content: { 'application/json': { schema: resolver(errorSchema) } } },
    },
  }),
  validator('param', v.object({ id: idSchema })),
  (c) => {
    const post = posts.find(c.req.valid('param').id)
    return post ? c.json(toPost(post)) : c.json(notFound('Publication'), 404)
  },
)

app.get('/openapi', openAPIRouteHandler(app, {
  documentation: {
    info: {
      title: 'Démonstration Hono + OpenAPI',
      version: '1.0.0',
      description: 'Contrat HTTP généré depuis les routes Hono et leurs schémas Valibot.',
    },
    servers: [{ url: 'http://localhost:3201', description: 'Serveur local' }],
  },
}))
