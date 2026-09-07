import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import '@demo/repositories/style.css'
import { getApiUsers } from './api/generated'

const queryClient = new QueryClient()

async function raw() {
  const response = await getApiUsers()
  if (response.status !== 200) return
  console.log('users', response.data)
}

void raw()

createRoot(document.getElementById('root')!).render(
  <StrictMode><QueryClientProvider client={queryClient}><App /></QueryClientProvider></StrictMode>,
)
