import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { userPostsQueryOptions, userQueryOptions } from '~/client/queries'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })
export const Route = createFileRoute('/users/$userId')({ component: UserPage })

function UserPage() {
  const { userId } = Route.useParams()
  const userQuery = useQuery(userQueryOptions(userId))
  const postsQuery = useQuery(userPostsQueryOptions(userId))
  if (userQuery.isPending || postsQuery.isPending) return <main className="page"><p className="notice" role="status">Chargement de l’utilisateur…</p></main>
  if (userQuery.isError || postsQuery.isError) return <main className="page"><p className="notice error" role="alert">Identifiant invalide ou erreur de chargement.</p></main>
  const user = userQuery.data
  const posts = postsQuery.data
  if (!user || !posts) return <main className="page"><p className="notice">Utilisateur introuvable.</p><Link to="/">Retour à la liste</Link></main>
  return <main className="page"><header className="page-header"><span className="eyebrow">UTILISATEUR</span><h1>{user.name}</h1><p>{user.email} · créé le {dateFormat.format(user.createdAt)}</p></header>
    <section className="panel"><div className="panel-heading"><h2>Publications <span className="count">{posts.length}</span></h2></div>
      {posts.length === 0 ? <p className="notice">Cet utilisateur n’a aucune publication.</p> : <div className="table-scroll"><table><thead><tr><th>Titre</th><th>Créée le</th></tr></thead><tbody>{posts.map((post) => <tr key={post.id}><th><Link to="/posts/$postId" params={{ postId: post.id }}>{post.title}</Link></th><td>{dateFormat.format(post.createdAt)}</td></tr>)}</tbody></table></div>}
    </section></main>
}
