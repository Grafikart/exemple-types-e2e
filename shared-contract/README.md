# Contrat TypeScript partagé avec ts-rest

Cette démo garde des routes REST explicites tout en partageant leur contrat entre le serveur et le frontend. Au lieu de recopier des DTO, les deux applications importent le même routeur ts-rest fondé sur Zod.

## Structure et source de vérité

```text
shared-contract/
  contract/src/index.ts  # schémas Zod et routes HTTP : source de vérité
  server/                # implémentation Bun du contrat
  front/                 # React, hooks ts-rest et formulaire
```

`contract/src/index.ts` est la source de vérité : `userSchema` décrit une réponse utilisateur, `createUserSchema` décrit le corps des mutations et `contract` associe ces schémas aux méthodes, URLs et statuts HTTP. Le serveur doit implémenter ce contrat ; le client ts-rest en déduit ses appels et ses types. Le modèle de `shared/` reste l'implémentation en mémoire, avec une conversion de `Date` en chaîne ISO au transport.

## Bibliothèques utilisées

- [ts-rest](https://ts-rest.com/) définit le contrat et fournit son adaptateur serveur et ses hooks client.
- [Zod](https://zod.dev/) décrit et valide les entrées et réponses du contrat.
- React, [TanStack React Query](https://tanstack.com/query) et [React Hook Form](https://react-hook-form.com/) composent l'interface.
- Bun exécute le serveur ; `@demo/repositories` fournit les données Faker.

## Exemple : ajouter `firstname` et `lastname`

Après avoir fait évoluer le modèle et le repository partagés, remplacez `name` dans les schémas du contrat :

```ts
export const userSchema = z.object({
  id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  createdAt: z.iso.datetime(),
})

export const createUserSchema = z.object({
  firstname: z.string().trim().min(1, 'Le prénom est requis.'),
  lastname: z.string().trim().min(1, 'Le nom est requis.'),
  email: z.string().trim().email('L’adresse email est invalide.'),
}).strict()
```

Le type de `contract` change immédiatement. Adaptez alors l'implémentation dans `server/` et le formulaire ainsi que les affichages dans `front/`. C'est le contrat qui assure la source de vérité, si le `front` ou `server` ne satisfait pas le contrat une erreur sera relevé lors de la vérification du typage.
