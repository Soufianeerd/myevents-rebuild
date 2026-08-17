<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Product Contract Workflow

Avant chaque développement de fonctionnalité (Feature) :

1. Lire `docs/product/PRODUCT-CONTRACT.md` et `docs/product/requirements.json`.
2. Lire les écrans concernés dans `docs/product/SCREEN-MATRIX.md` (référence canonique: Carrousel).
3. Identifier les requirement IDs applicables (ex: EVENT-001, AUTH-002, UI-005, etc.).
4. Implémenter en respectant scrupuleusement la vérité technique (Local-first, Core pur, etc.).
5. Tester (Unit, Integration, E2E si applicable).
6. Comparer visuellement à la référence du carrousel.
7. Mettre à jour `docs/product/TRACEABILITY-MATRIX.md` (et/ou `requirements.json`) avec l'état `verified` et les évidences.
8. Lancer `pnpm test:product` et l'ensemble de la suite de validation (`pnpm check:full`).
