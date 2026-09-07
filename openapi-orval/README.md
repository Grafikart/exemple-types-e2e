# Hono, OpenAPI et Orval

Cette démo conserve une API REST classique tout en publiant un contrat portable. Les routes Hono et leurs schémas Valibot produisent un document OpenAPI ; Orval le lit pour générer le client TypeScript et les hooks React Query du frontend.

Dans ce cas là le schéma OpenAPI est créé de manière automatique mais il est aussi possible d'imaginer un système où ce fichier serait créé et maintenu manuellement (il faudra alors s'assurer que le type est bien synchronisé).

## Bibliothèques utilisées

- [Hono](https://hono.dev/) définit les routes HTTP.
- [Valibot](https://valibot.dev/) valide les requêtes ; [hono-openapi](https://github.com/rhinobase/hono-openapi) les transforme en OpenAPI.
- [Orval](https://orval.dev/) génère le client TypeScript et les hooks.
- React, TanStack React Query et React Hook Form composent le frontend.

## Exemple : ajouter `firstname` et `lastname`

Après la modification du modèle et du repository partagés, adaptez les schémas dans `server/app.ts` :

```ts
const createUserSchema = v.object({
  firstname: v.pipe(v.string(), v.trim(), v.minLength(1)),
  lastname: v.pipe(v.string(), v.trim(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
})

const userSchema = v.object({
  id: v.string(),
  firstname: v.string(),
  lastname: v.string(),
  email: v.pipe(v.string(), v.email()),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
})
```

Le changement des schémas va aussi permettre de mettre à jour le schéma OpenAPI. Côté front, on va générer les types via `bun run generate`. La rupture de contrat devient visible dans le frontend après la régénération : c'est le coût assumé d'un contrat OpenAPI exploitable par d'autres langages.
