import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { usersQueryOptions } from '~/client/queries'
import { createUser } from '~/server/users.functions'

type CreateUserInput = { name: string; email: string }
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

export const Route = createFileRoute('/')({ component: UsersPage })

function UsersPage() {
  const queryClient = useQueryClient()
  const usersQuery = useQuery(usersQueryOptions())
  const form = useForm<CreateUserInput>()
  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => createUser({ data }),
    onSuccess: async () => {
      form.reset()
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
  const users = usersQuery.data ?? []

  return <main className="page">
    <header className="page-header">
      <span className="eyebrow">DÉMONSTRATION · SERVER FUNCTIONS</span>
      <h1>Utilisateurs</h1>
      <p>Le composant appelle des fonctions serveur importées directement, sans client HTTP écrit à la main.</p>
    </header>
    <div className="layout">
      <section className="panel users-panel" aria-labelledby="users-title" aria-busy={usersQuery.isFetching}>
        <div className="panel-heading">
          <h2 id="users-title">Tous les utilisateurs <span className="count">{users.length}</span></h2>
          <button className="secondary" type="button" onClick={() => usersQuery.refetch()} disabled={usersQuery.isFetching}>Actualiser</button>
        </div>
        {usersQuery.isPending && <p className="notice" role="status">Chargement des utilisateurs…</p>}
        {usersQuery.isError && <p className="notice error" role="alert">Impossible de charger les utilisateurs.</p>}
        {usersQuery.isSuccess && users.length === 0 && <p className="notice">Aucun utilisateur.</p>}
        {users.length > 0 && <div className="table-scroll"><table>
          <caption className="sr-only">Liste des utilisateurs</caption>
          <thead><tr><th scope="col">Nom</th><th scope="col">Email</th><th scope="col">Créé le</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id}>
            <th scope="row"><Link to="/users/$userId" params={{ userId: user.id }}>{user.name}</Link></th>
            <td>{user.email}</td><td><time dateTime={user.createdAt.toISOString()}>{dateFormat.format(user.createdAt)}</time></td>
          </tr>)}</tbody>
        </table></div>}
      </section>
      <section className="panel form-panel" aria-labelledby="add-title">
        <h2 id="add-title">Ajouter un utilisateur</h2>
        <p className="form-intro">Validation Zod dans la fonction serveur.</p>
        <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} aria-busy={createMutation.isPending}>
          <fieldset disabled={createMutation.isPending}>
            <label htmlFor="name">Nom complet</label>
            <input id="name" autoComplete="name" required {...form.register('name')} />
            <label htmlFor="email">Adresse email</label>
            <input id="email" type="email" autoComplete="email" required {...form.register('email')} />
            <button className="primary" type="submit">{createMutation.isPending ? 'Ajout en cours…' : 'Ajouter l’utilisateur'}</button>
          </fieldset>
          {createMutation.isError && <p className="error feedback" role="alert">Vérifiez le nom et l’adresse email.</p>}
          {createMutation.isSuccess && <p className="success feedback" role="status">{createMutation.data.name} a été ajouté.</p>}
        </form>
        <p className="footnote">Les ajouts sont conservés en mémoire jusqu’au redémarrage.</p>
      </section>
    </div>
  </main>
}
