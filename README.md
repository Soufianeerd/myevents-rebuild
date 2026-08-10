# MyEvent's

Plateforme événementielle premium (Local-First Bootstrap).

## État actuel : Reconstruction / Session 00

Le projet est en cours de refonte totale avec une architecture rigoureuse, en commençant par des fondations strictement local-first.

## Stack technique

- **Node.js** : v22.22.3
- **Gestionnaire de paquets** : pnpm (10.34.5)
- **Framework** : Next.js (App Router)
- **UI** : React, Tailwind CSS
- **Langage** : TypeScript (mode strict)

## Lancement

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

L'application démarre avec `APP_MODE=local`. **Aucune API externe n'est requise** à ce stade (conformément au principe local-first).

## Architecture

Le flux de données standard est le suivant :

`UI → Server Action / Route Handler → Domain Service → Provider Contract → Adapter`

### Principaux dossiers

- `src/core/` : Logique métier pure, types de domaine et schémas Zod.
- `src/providers/contracts/` : Interfaces pour les services externes.
- `src/providers/local/` : Implémentations locales de ces contrats.
- `src/features/` : Logique applicative par fonctionnalité.
- `src/components/ui/` : Design system.
- `src/components/invitation/` : Renderer de l'invitation.

## Commandes disponibles

- `pnpm dev` : Démarrer le serveur de développement.
- `pnpm build` : Construire pour la production.
- `pnpm start` : Démarrer l'application construite.
- `pnpm format:check` : Vérifier le formatage (Prettier).
- `pnpm lint` : Analyser le code (ESLint).
- `pnpm typecheck` : Vérifier les types TypeScript.
- `pnpm check` : Validation standard (format, lint, typecheck, tests unitaires, build).

## Stratégie de tests

L'application utilise :

- **Vitest** pour les tests unitaires (`pnpm test:unit`) et d'intégration (`pnpm test:integration`).
- **Playwright** pour les tests End-to-End (`pnpm test:e2e`).

## Documentation et Roadmap

Consultez le dossier [`docs/`](./docs) pour les principes détaillés : architecture, vision, conventions, sécurité et accessibilité.

### Macro-Roadmap

- **Session 00** : Fondations
- **Session 01** : Design system pixel-perfect
- **Session 02** : AppShell / Sidebar / Topbar
- **Session 03** : Architecture domaine + providers local-first
- (Voir `docs/07-ROADMAP.md` pour la suite).
