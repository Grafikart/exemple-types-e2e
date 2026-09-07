# TanStack Start et les Server Functions

Cette démo montre une application full-stack unique : le composant React appelle une fonction déclarée côté serveur, et TanStack Start transforme cet appel en RPC same-origin au build. On garde ainsi une signature TypeScript continue sans écrire de client HTTP à la main.

## Structure et source de vérité

```text
server-functions/src/
  server/*.functions.ts  # fonctions serveur et validateurs : contrat
  client/queries.ts      # options React Query
  routes/                # pages et formulaire React
```

La fonction serveur est la source de vérité du typage. Par exemple, `createUser` associe son validateur Zod à son handler ; son appel `createUser({ data })` est typé dans la route. Le framework sérialise l'appel et préserve les `Date`, mais ce contrat reste lié à la même application TanStack Start. Pour une API publique, on utiliserait des Server Routes.

## Bibliothèques utilisées

- [TanStack Start](https://tanstack.com/start) crée et transporte les Server Functions.
- [TanStack React Query](https://tanstack.com/query) gère cache, chargement et invalidation.
- [React](https://react.dev/) affiche l'interface et [React Hook Form](https://react-hook-form.com/) gère le formulaire.
- [Zod](https://zod.dev/) valide les identifiants et le corps de création à l'exécution.

## Exemple : ajouter `firstname` et `lastname`

Si on change la structure des données, on fait évoluer le validateur dans `src/server/users.functions.ts` :

```ts
const createUserSchema = z.object({
  firstname: z.string().trim().min(1, 'Un prénom est requis.'),
  lastname: z.string().trim().min(1, 'Un nom est requis.'),
  email: z.email('Saisissez une adresse email valide.'),
})
```

La signature de toutes les méthodes sont alors mise à jour automatiquement et le code front-end remontera les erreurs automatiquement.
