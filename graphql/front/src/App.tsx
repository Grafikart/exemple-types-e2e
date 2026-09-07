import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'urql'
import type { CreateUserMutationVariables } from './gql/graphql'
import { CreateUserDocument, UsersDocument } from './gql/graphql'

type CreateUserForm = CreateUserMutationVariables['input']

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

function App() {
  const [usersResult, reexecuteUsers] = useQuery({ query: UsersDocument })
  const [createResult, createUser] = useMutation(CreateUserDocument)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserForm>()
  const users = usersResult.data?.users ?? []

  const submit = async (input: CreateUserForm) => {
    const result = await createUser({ input })
    if (!result.error) reset()
  }

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">DÉMONSTRATION · GRAPHQL + CODEGEN</span>
        <h1>Utilisateurs</h1>
        <p>Consultez les utilisateurs et ajoutez un nouveau profil.</p>
      </header>
      <div className="layout">
        <section className="panel users-panel" aria-labelledby="users-title" aria-busy={usersResult.fetching}>
          <div className="panel-heading">
            <h2 id="users-title">Tous les utilisateurs <span className="count">{users.length}</span></h2>
            <button className="secondary" type="button" onClick={() => reexecuteUsers({ requestPolicy: 'network-only' })} disabled={usersResult.fetching || createResult.fetching}>Actualiser</button>
          </div>
          {usersResult.fetching && !usersResult.data && <p className="notice" role="status">Chargement des utilisateurs…</p>}
          {usersResult.error && <p className="notice error" role="alert">Impossible de charger les utilisateurs. Vérifiez le serveur puis actualisez.</p>}
          {!usersResult.fetching && !usersResult.error && users.length === 0 && <p className="notice">Aucun utilisateur. Ajoutez le premier avec le formulaire.</p>}
          {users.length > 0 && <div className="table-scroll"><table>
            <caption className="sr-only">Liste des utilisateurs et date de création</caption>
            <thead><tr><th scope="col">Nom</th><th scope="col">Email</th><th scope="col">Créé le</th></tr></thead>
            <tbody>{users.map((user) => <tr key={user.id}><th scope="row">{user.name}</th><td>{user.email}</td><td><time dateTime={user.createdAt}>{dateFormat.format(new Date(user.createdAt))}</time></td></tr>)}</tbody>
          </table></div>}
        </section>
        <section className="panel form-panel" aria-labelledby="add-title">
          <h2 id="add-title">Ajouter un utilisateur</h2>
          <p className="form-intro">Un nom, un email, et c’est tout.</p>
          <form onSubmit={handleSubmit(submit)} aria-busy={createResult.fetching}>
            <fieldset disabled={createResult.fetching}>
              <label htmlFor="name">Nom complet</label>
              <input id="name" autoComplete="name" placeholder="Alice Martin" required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} {...register('name', { validate: (value) => Boolean(value.trim()) || 'Saisissez un nom.' })} />
              {errors.name && <p id="name-error" className="error feedback" role="alert">{errors.name.message}</p>}
              <label htmlFor="email">Adresse email</label>
              <input id="email" type="email" autoComplete="email" placeholder="alice@exemple.fr" required {...register('email')} />
              <button className="primary" type="submit" disabled={createResult.fetching}>{createResult.fetching ? 'Ajout en cours…' : 'Ajouter l’utilisateur'}</button>
            </fieldset>
            {createResult.error && <p className="error feedback" role="alert">Vérifiez le nom et l’adresse email.</p>}
            {createResult.data && <p className="success feedback" role="status">{createResult.data.createUser.name} a été ajouté. Actualisez la liste pour le voir.</p>}
          </form>
          <p className="footnote">Documents GraphQL et types TypeScript générés depuis le schéma SDL.</p>
        </section>
      </div>
    </main>
  )
}

export default App
