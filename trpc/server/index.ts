import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './appRouter';

const server = Bun.serve({
  port: 3000,
  fetch: (req) => fetchRequestHandler({
    endpoint: '/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  }),
});

console.log(`tRPC server listening on ${server.url}trpc`);
