import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { useState } from 'react'
import appCss from '@demo/repositories/style.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Server Functions · démonstration' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: Root,
})

function Root() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <html lang="fr">
      <head><HeadContent /></head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
