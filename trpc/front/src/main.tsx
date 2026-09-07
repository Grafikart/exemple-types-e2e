import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient, trpcClient } from './trpc'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@demo/repositories/style.css'
import App from './App.tsx'

async function raw() {
  const users = await trpcClient.userList.query()
  console.log('users', users)
}

void raw()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
