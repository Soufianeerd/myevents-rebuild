# Instructions pour l'Assistant

Ce projet est une reconstruction complète de l'application **MyEvent's**.

## Principes Fondamentaux

1. **Local-First** : Aucun fournisseur externe (Supabase, Stripe, etc.) n'est autorisé jusqu'à indication contraire. Tout doit fonctionner en local avec des "Local Adapters".
2. **Architecture** : UI -> Route Handler/Server Action -> Domain Service -> Provider Contract -> Adapter.
3. **Sécurité** : Validation serveur, isolation multi-tenant, opérations critiques idempotentes.
4. **Accessibilité** : Cible WCAG 2.2 AA.
5. **Design** : "Quiet luxury" (Bordeaux, Ivoire, Doré, Neutres chauds). Les composants doivent être pixel-perfect.

## Commandes de Validation

**Validation standard :**

```bash
pnpm check
```

Exécute : `format:check`, `lint`, `typecheck`, `unit tests` et `build`.

**Validation complète avant clôture d'une session :**

```bash
pnpm check
pnpm test:integration
pnpm test:e2e
git diff --check
```

Veuillez consulter le dossier `docs/` pour l'ensemble des principes architecturaux et la roadmap.
