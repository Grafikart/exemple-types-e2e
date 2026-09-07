import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { inferRouterInputs } from '@trpc/server'
import type { AppRouter } from '../../server/appRouter'

export const queryClient = new QueryClient()

export const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/trpc' })],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient })
export type CreateUserInput = inferRouterInputs<AppRouter>['userCreate']
export type Users = Awaited<ReturnType<typeof trpcClient.userList.query>>
