import { initContract } from '@ts-rest/core'
import { z } from 'zod'

const c = initContract()

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.iso.datetime(),
})

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis.'),
  email: z.string().trim().email('L’adresse email est invalide.'),
}).strict()

export const apiErrorSchema = z.object({
  message: z.string(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
})

const validationIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
})

// The shape emitted by ts-rest when its request validation rejects a body.
export const validationErrorSchema = z.object({
  message: z.string(),
  bodyErrors: z.object({ issues: z.array(validationIssueSchema) }).nullable().optional(),
})

export const contract = c.router({
  users: {
    list: {
      method: 'GET',
      path: '/users',
      responses: { 200: z.array(userSchema) },
      summary: 'List users',
    },
    find: {
      method: 'GET',
      path: '/users/:id',
      pathParams: z.object({ id: z.string().uuid() }),
      responses: { 200: userSchema, 404: apiErrorSchema },
      summary: 'Find a user',
    },
    create: {
      method: 'POST',
      path: '/users',
      body: createUserSchema,
      responses: { 201: userSchema, 400: validationErrorSchema },
      summary: 'Create a user',
    },
    update: {
      method: 'PATCH',
      path: '/users/:id',
      pathParams: z.object({ id: z.string().uuid() }),
      body: createUserSchema.partial().refine(
        (body) => body.name !== undefined || body.email !== undefined,
        'Provide at least one field to update.',
      ),
      responses: { 200: userSchema, 400: validationErrorSchema, 404: apiErrorSchema },
      summary: 'Update a user',
    },
    delete: {
      method: 'DELETE',
      path: '/users/:id',
      pathParams: z.object({ id: z.string().uuid() }),
      responses: { 200: userSchema, 404: apiErrorSchema },
      summary: 'Delete a user',
    },
  },
})
