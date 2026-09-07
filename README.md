# Comparer le typage de bout en bout

Ce dépôt compare plusieurs manières de faire circuler un type entre un serveur et un front end. Chaque démonstration manipule le même modèle `User`, les mêmes données Faker et une petite API de publications. La différence se situe dans la manière d'échanger le typage entre le backend et el frontend.

## Structure du dépôt

```text
shared/             # modèles et repositories en mémoire communs aux différentes apps
trpc/               # RPC TypeScript, serveur et client séparés
shared-contract/    # contrat REST TypeScript partagé avec ts-rest
openapi-orval/      # routes REST → OpenAPI → client généré par Orval
graphql/            # schéma GraphQL → types et opérations générés
server-functions/   # application TanStack Start et fonctions serveur
```

`shared/src/models.ts` est la source de vérité des données en mémoire (`User` et `Post`) et simule ce qui se passerait si on communiquait avec une base de données.

| Démo | Source de vérité du contrat | Propagation vers le client |
| --- | --- | --- |
| [tRPC](./trpc/) | Le routeur serveur `AppRouter` | Inférence TypeScript directe |
| [Contrat partagé](./shared-contract/) | Contrat ts-rest et schémas Zod | Même contrat importé par les deux côtés |
| [OpenAPI + Orval](./openapi-orval/) | Routes Hono et schémas Valibot, exportés en OpenAPI | Client et hooks générés |
| [GraphQL](./graphql/) | SDL `schema.graphql` et opérations `.graphql` | Types générés pour serveur et client |
| [Server Functions](./server-functions/) | Signatures des fonctions serveur | Import direct transformé en RPC au build |
