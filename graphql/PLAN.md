# Plan — démonstration GraphQL end-to-end

## But

Ajouter une démonstration autonome de typage end-to-end avec GraphQL, comparable aux démonstrations tRPC, OpenAPI/Orval et contrat TypeScript partagé. La chaîne de contrat étudiée est :

```text
schema.graphql → génération des types → résolveurs et opérations clientes typés
```

L’implémentation suit ce plan.

## Organisation

```text
graphql/
  PLAN.md
  README.md
  server/
  front/
```

- `graphql/server` : serveur Bun avec GraphQL Yoga, exposant `POST /graphql`.
- `graphql/front` : client React/Vite avec urql.
- Vite proxifiera `/graphql` vers le serveur, avec des ports dédiés et stricts. Aucune configuration CORS ne sera nécessaire au développement.
- Le serveur réutilisera `shared/` pour les modèles, repositories, données Faker et invariants.

## Contrat

Le fichier SDL versionné `schema.graphql` est la source de vérité.

- Types : `User`, `Post`, `CreateUserInput`.
- Scalaire : `DateTime`, sérialisé en chaîne ISO 8601 sur le transport JSON. Il est typé `string` côté client ; le serveur conserve les `Date` du modèle partagé.
- Requêtes : `users`, `user(id: ID!)`, `post(id: ID!)`.
- Relations : `User.posts` et `Post.author`.
- Mutation : `createUser(input: CreateUserInput!): User!`.

L’interface utilisera seulement la liste des utilisateurs et `createUser`, comme les interfaces de démonstration existantes. Les requêtes et relations de détail restent exposées dans le schéma pour couvrir le domaine commun.

## Validation et erreurs

Le schéma assure la forme des entrées. Le serveur valide les règles métier : nom non vide et adresse email valide.

- Entrée invalide : erreur GraphQL avec `extensions.code: "BAD_USER_INPUT"`.
- Identifiant inconnu : erreur GraphQL avec `extensions.code: "NOT_FOUND"`.
- Les consultations de ressource sont non nulles dans le schéma ; l’absence ne devient pas un `null` silencieux.

## Génération de types

GraphQL Code Generator produira :

- les types de résolveurs du serveur depuis le SDL ;
- les types des opérations clientes et des `TypedDocumentNode` depuis le SDL et les documents `.graphql` du client.

Les artefacts générés seront versionnés. Une commande `bun run codegen` les régénérera et sera décrite dans le README, avec la vérification TypeScript.

## Interface et comportement

Le client React/Vite utilisera urql et affichera :

- la liste des utilisateurs ;
- un bouton d’actualisation ;
- un formulaire de création avec les champs `name` et `email` ;
- les états de chargement, d’erreur, de réussite et de liste vide.

La stratégie de cache et l’actualisation automatique après mutation ne font pas partie de ce premier jalon.

## Vérification

Les tests Bun exécuteront des opérations contre le schéma GraphQL réel et couvriront au minimum :

- une lecture ;
- une création valide ;
- une création invalide et `BAD_USER_INPUT` ;
- un identifiant inconnu et `NOT_FOUND`.

La démonstration fournira également une commande de vérification TypeScript. Son README expliquera la source de vérité, la génération, les garanties et limites du typage, puis un exercice de modification du contrat — par exemple `Post.title` renommé en `Post.headline` — et la régénération nécessaire pour voir l’incompatibilité côté client.
