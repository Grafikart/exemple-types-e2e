import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { api } from './api'
import App from './App'
import '@demo/repositories/style.css'
import { initClient } from '@ts-rest/core'
import { contract } from '@demo/shared-contract'

const queryClient = new QueryClient()
const client = initClient(contract, { baseUrl: '' })

async function raw() {
  const response = await client.users.list()
  if (response.status !== 200) return
  console.log('users', response.body)
}

void raw()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <api.ReactQueryProvider>
        <App />
      </api.ReactQueryProvider>
    </QueryClientProvider>
  </StrictMode>,
)
