# GraphQL et GraphQL Code Generator

Cette démo sépare un serveur GraphQL et un client React. GraphQL est intéressant ici car le schéma décrit les possibilités de l'API, tandis que chaque opération cliente décrit exactement les champs qu'elle consomme.

## Structure et source de vérité

```text
graphql/
  schema.graphql       # SDL : contrat GraphQL
  server/              # GraphQL Yoga, résolveurs et types générés
  front/               # React, urql, opérations .graphql et types générés
```

`schema.graphql` est la source de vérité du contrat serveur : il définit `User`, les entrées et les requêtes autorisées. Les fichiers `front/src/operations.graphql` sont la source de vérité complémentaire de ce que le client sélectionne réellement. GraphQL Code Generator dérive les types de résolveurs et les `TypedDocumentNode` ; les fichiers `src/generated/` et `src/gql/` ne se modifient pas à la main.

## Bibliothèques utilisées

- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) expose le serveur GraphQL.
- [graphql](https://graphql.org/) fournit le runtime, le schéma et l'exécution.
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) génère les types serveur et client.
- [urql](https://formidable.com/open-source/urql/) exécute les opérations depuis React.
- Zod valide les entrées métier côté résolveur ; React Hook Form porte le formulaire.

## Démarrer et vérifier

Dans deux terminaux :

```bash
cd graphql/server && bun install --frozen-lockfile && bun run start
cd graphql/front && bun install --frozen-lockfile && bun run dev
```

Le serveur écoute sur `http://localhost:3300/graphql`, le client sur `http://localhost:5176`. Après une modification, régénérez puis vérifiez :

```bash
cd graphql/server && bun run codegen && bun run typecheck && bun test
cd graphql/front && bun run codegen && bun run typecheck
```

## Exemple : ajouter `firstname` et `lastname`

Après l'évolution du modèle partagé, faites évoluer le SDL :

```graphql
type User {
  id: ID!
  firstname: String!
  lastname: String!
  email: String!
  createdAt: DateTime!
}

input CreateUserInput {
  firstname: String!
  lastname: String!
  email: String!
}
```

Adaptez ensuite `server/src/schema.ts` pour valider les deux entrées, et les documents dans `front/src/operations.graphql` pour sélectionner les deux champs. Lancez les deux commandes `bun run codegen` : les types générés révèlent les résolveurs ou composants qui utilisent encore `name`. Cette régénération est indispensable avant la vérification TypeScript.

## Le rôle de Code Generator

Le codegen évite de réécrire manuellement les types qui existent déjà dans le schéma GraphQL. Il lit le SDL `schema.graphql` et produit deux choses différentes selon le package :

- dans `server/`, les types des résolveurs. Un résolveur de `User` doit donc retourner les champs et les types déclarés dans le schéma.
- dans `front/`, les types des résultats et variables de chaque opération dans `src/operations.graphql`, ainsi que des `TypedDocumentNode` utilisables par urql.

Le schéma dit ce que l'API autorise, mais le codegen client ne génère que les champs réellement sélectionnés. Une requête qui demande `id` et `firstname` ne reçoit donc pas par magie `email` dans son type.
