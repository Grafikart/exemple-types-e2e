import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Client, Provider, cacheExchange, fetchExchange } from 'urql'
import App from './App'
import '@demo/repositories/style.css'
import { UsersConsoleExampleDocument } from './gql/graphql'

const client = new Client({ url: '/graphql', exchanges: [cacheExchange, fetchExchange] })

// Exemple urql : seuls les champs `id` et `name` sont demandés et typés.
function raw() {
  void client.query(UsersConsoleExampleDocument, {}).toPromise().then((result) => {
    if (result.error) {
      console.error('Impossible de récupérer les utilisateurs :', result.error)
      return
    }
    console.log('Utilisateurs (id, name) :', result.data?.users)
  })
}

void raw()

createRoot(document.getElementById('root')!).render(
  <StrictMode><Provider value={client}><App /></Provider></StrictMode>,
)
