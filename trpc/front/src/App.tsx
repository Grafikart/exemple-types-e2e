import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { queryClient, trpc, trpcClient } from './trpc'
import type { CreateUserInput } from './trpc'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

 function demo() {
   return trpcClient.userCreate.mutate({
     email: 'john',
     name: 'doe',
   }).catch(() => {
  })
 }

demo();

function App() {
  const usersQuery = useQuery(trpc.userList.queryOptions())
  const users = usersQuery.data ?? []
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserInput>()
  const createUser = useMutation(trpc.userCreate.mutationOptions({
    onSuccess: async () => {
      reset()
      await queryClient.invalidateQueries(trpc.userList.queryFilter())
    },
  }))

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">DÉMONSTRATION · tRPC</span>
        <h1>Utilisateurs</h1>
        <p>Consultez les utilisateurs et ajoutez un nouveau profil.</p>
      </header>

      <div className="layout">
        <section className="panel users-panel" aria-labelledby="users-title" aria-busy={usersQuery.isFetching}>
          <div className="panel-heading">
            <h2 id="users-title">Tous les utilisateurs <span className="count">{users.length}</span></h2>
            <button className="secondary" type="button" onClick={() => usersQuery.refetch()} disabled={usersQuery.isFetching || createUser.isPending}>
              Actualiser
            </button>
          </div>
          {usersQuery.isPending && <p className="notice" role="status">Chargement des utilisateurs…</p>}
          {usersQuery.isError && <p className="notice error" role="alert">Impossible de charger les utilisateurs. Vérifiez le serveur puis actualisez.</p>}
          {usersQuery.isSuccess && users.length === 0 && (
            <p className="notice">Aucun utilisateur. Ajoutez le premier avec le formulaire.</p>
          )}
          {users.length > 0 && (
            <div className="table-scroll">
              <table>
                <caption className="sr-only">Liste des utilisateurs et date de création</caption>
                <thead><tr><th scope="col">Nom</th><th scope="col">Email</th><th scope="col">Créé le</th></tr></thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <th scope="row">{user.name}</th>
                      <td>{user.email}</td>
                      <td><time dateTime={user.createdAt}>{dateFormat.format(new Date(user.createdAt))}</time></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel form-panel" aria-labelledby="add-title">
          <h2 id="add-title">Ajouter un utilisateur</h2>
          <p className="form-intro">Un nom, un email, et c’est tout.</p>
          <form onSubmit={handleSubmit((data) => createUser.mutate(data))} aria-busy={createUser.isPending}>
            <fieldset disabled={createUser.isPending}>
              <label htmlFor="name">Nom complet</label>
              <input id="name" autoComplete="name" placeholder="Alice Martin" required
                aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined}
                {...register('name', { validate: (value) => Boolean(value.trim()) || 'Saisissez un nom.' })} />
              {errors.name && <p id="name-error" className="error feedback" role="alert">{errors.name.message}</p>}
              <label htmlFor="email">Adresse email</label>
              <input id="email" type="email" autoComplete="email" placeholder="alice@exemple.fr" required
                {...register('email')} />
              <button className="primary" type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? 'Ajout en cours…' : 'Ajouter l’utilisateur'}
              </button>
            </fieldset>
            {createUser.isError && <p className="error feedback" role="alert">
              {createUser.error.data?.code === 'BAD_REQUEST'
                ? 'Vérifiez le nom et l’adresse email.'
                : 'L’ajout n’a pas pu être confirmé. Actualisez la liste avant de réessayer.'}
            </p>}
            {createUser.isSuccess && <p className="success feedback" role="status">{createUser.data.name} a été ajouté.</p>}
          </form>
          <p className="footnote">Données de démonstration. Les ajouts sont conservés jusqu’au redémarrage du serveur.</p>
        </section>
      </div>
    </main>
  )
}

export default App
