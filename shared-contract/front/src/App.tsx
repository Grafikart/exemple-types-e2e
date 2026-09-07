import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { createUserSchema } from '@demo/shared-contract'
import { api } from './api'

type CreateUser = z.input<typeof createUserSchema>
const usersKey = ['users'] as const

function App() {
  const users = api.users.list.useQuery({ queryKey: usersKey })
  const queryClient = api.useQueryClient()
  const { register, handleSubmit, reset, setError, clearErrors, formState: { errors } } = useForm<CreateUser>()
  const createUser = api.users.create.useMutation({
    onMutate: () => clearErrors(),
    onSuccess: async (response) => {
      if (response.status !== 201) return
      reset()
      await queryClient.invalidateQueries({ queryKey: usersKey })
    },
    onError: (error) => {
      if (error instanceof Error || error.status !== 400) {
        setError('root.server', { type: 'server', message: 'Le serveur ne répond pas. Réessayez après actualisation.' })
        return
      }

      const issues = error.body.bodyErrors?.issues ?? []
      for (const issue of issues) {
        const field = issue.path[0]
        if (field === 'name' || field === 'email') {
          setError(field, { type: 'server', message: issue.message })
        }
      }

      if (issues.length === 0) setError('root.server', { type: 'server', message: error.body.message })
    },
  })

  const response = users.data
  const list = response?.status === 200 ? response.body : []

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">DÉMONSTRATION · CONTRAT TS PARTAGÉ</span>
        <h1>Utilisateurs</h1>
        <p>Consultez les utilisateurs et ajoutez un nouveau profil.</p>
      </header>
      <div className="layout">
        <section className="panel users-panel" aria-labelledby="users-title" aria-busy={users.isFetching}>
          <div className="panel-heading">
            <h2 id="users-title">Tous les utilisateurs <span className="count">{list.length}</span></h2>
            <button className="secondary" type="button" onClick={() => users.refetch()} disabled={users.isFetching || createUser.isPending}>Actualiser</button>
          </div>
          {users.isPending && <p className="notice" role="status">Chargement des utilisateurs…</p>}
          {users.isError && <p className="notice error" role="alert">Impossible de charger les utilisateurs. Vérifiez le serveur puis actualisez.</p>}
          {users.isSuccess && list.length === 0 && <p className="notice">Aucun utilisateur. Ajoutez le premier avec le formulaire.</p>}
          {list.length > 0 && <div className="table-scroll"><table>
            <caption className="sr-only">Liste des utilisateurs et date de création</caption>
            <thead><tr><th scope="col">Nom</th><th scope="col">Email</th><th scope="col">Créé le</th></tr></thead>
            <tbody>{list.map((user) => <tr key={user.id}><th scope="row">{user.name}</th><td>{user.email}</td><td><time dateTime={user.createdAt}>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</time></td></tr>)}</tbody>
          </table></div>}
        </section>
        <section className="panel form-panel" aria-labelledby="add-title"><h2 id="add-title">Ajouter un utilisateur</h2>
          <p className="form-intro">Un nom, un email, et c’est tout.</p>
          <form onSubmit={handleSubmit((body) => createUser.mutate({ body }))} aria-busy={createUser.isPending}>
            <fieldset disabled={createUser.isPending}>
              <label htmlFor="name">Nom complet</label>
              <input id="name" type="text" autoComplete="name" placeholder="Alice Martin" required {...register('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
              {errors.name && <p id="name-error" className="error feedback" role="alert">{errors.name.message}</p>}
              <label htmlFor="email">Adresse email</label>
              <input id="email" type="email" autoComplete="email" placeholder="alice@exemple.fr" required {...register('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
              {errors.email && <p id="email-error" className="error feedback" role="alert">{errors.email.message}</p>}
              <button className="primary" type="submit" disabled={createUser.isPending}>{createUser.isPending ? 'Ajout en cours…' : 'Ajouter l’utilisateur'}</button>
            </fieldset>
            {errors.root?.server && <p className="error feedback" role="alert">{errors.root.server.message}</p>}
          </form>
          <p className="footnote">Un contrat TypeScript décrit une API REST consommée par le serveur et React.</p>
        </section>
      </div>
    </main>
  )
}

export default App
