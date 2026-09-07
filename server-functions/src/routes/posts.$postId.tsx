import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { postQueryOptions, userQueryOptions } from '~/client/queries'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })
export const Route = createFileRoute('/posts/$postId')({ component: PostPage })

function PostPage() {
  const { postId } = Route.useParams()
  const postQuery = useQuery(postQueryOptions(postId))
  const post = postQuery.data
  const authorQuery = useQuery({ ...userQueryOptions(post?.userId ?? ''), enabled: Boolean(post) })
  if (postQuery.isPending) return <main className="page"><p className="notice" role="status">Chargement de la publication…</p></main>
  if (postQuery.isError) return <main className="page"><p className="notice error" role="alert">Identifiant invalide ou erreur de chargement.</p></main>
  if (!post) return <main className="page"><p className="notice">Publication introuvable.</p><Link to="/">Retour à la liste</Link></main>
  return <main className="page"><header className="page-header"><span className="eyebrow">PUBLICATION</span><h1>{post.title}</h1><p>Créée le {dateFormat.format(post.createdAt)}</p></header>
    <section className="panel form-panel"><p className="form-intro">{post.body}</p>
      {authorQuery.isPending && <p className="notice" role="status">Chargement de l’auteur…</p>}
      {authorQuery.isError && <p className="error feedback" role="alert">Impossible de charger l’auteur.</p>}
      {authorQuery.data && <p className="feedback">Auteur : <Link to="/users/$userId" params={{ userId: authorQuery.data.id }}>{authorQuery.data.name}</Link></p>}
    </section></main>
}
