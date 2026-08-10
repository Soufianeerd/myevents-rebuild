# Instructions pour l'Assistant

Ce projet est une reconstruction complète de l'application **MyEvent's**.

## Principes Fondamentaux

1. **Local-First** : Aucun fournisseur externe (Supabase, Stripe, etc.) n'est autorisé jusqu'à indication contraire. Tout doit fonctionner en local avec des "Local Adapters".
2. **Architecture** : UI -> Route Handler/Server Action -> Domain Service -> Provider Contract -> Adapter.
3. **Sécurité** : Validation serveur, isolation multi-tenant, opérations critiques idempotentes.
4. **Accessibilité** : Cible WCAG 2.2 AA.
5. **Design** : "Quiet luxury" (Bordeaux, Ivoire, Doré, Neutres chauds). Les composants doivent être pixel-perfect.

## Commandes

- `pnpm dev` : Lancer en local
- `pnpm check` : Validation complète (Prettier, ESLint, TypeScript, Tests Unitaires, Build)
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`

Veuillez consulter le dossier `docs/` pour l'ensemble des principes architecturaux et la roadmap.
