import { TRPCError } from '@trpc/server';
import { UserRepository } from '@demo/repositories';
import { z } from 'zod';
import { publicProcedure, router } from './trpc';

const users = new UserRepository();
const userId = z.object({ id: z.string().trim().min(1) }).strict();
const userFields = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
}).strict();
const userUpdate = userId.extend({
  data: userFields.partial().refine(
    (data) => data.name !== undefined || data.email !== undefined,
    { message: 'Provide at least a name or email to update.' },
  ),
});

function requireUser<T>(user: T | undefined): T {
  if (user === undefined) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
  }
  return user;
}

export const appRouter = router({
  userList: publicProcedure.query(() => users.findAll()),
  userFind: publicProcedure.input(userId)
    .query(({ input }) => requireUser(users.find(input.id))),
  userCreate: publicProcedure.input(userFields)
    .mutation(({ input }) => users.create(input)),
  userUpdate: publicProcedure.input(userUpdate)
    .mutation(({ input }) => requireUser(users.update(input.id, input.data))),
  userDelete: publicProcedure.input(userId)
    .mutation(({ input }) => requireUser(users.delete(input.id))),
});

export type AppRouter = typeof appRouter;
