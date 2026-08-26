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

==================================================
# FUTURE PROMPT CONTRACT
==================================================

AVANT CHAQUE SESSION FEATURE :

1. Lire PRODUCT-SPEC.
2. Lire les sections explicitement mentionnées dans la session.
3. Lire DECISION-REGISTER.
4. Lire les références UI concernées.
5. Lire UI-GAPS.
6. Lire les contraintes Architecture.
7. Lire Security/A11y.
8. Auditer ce qui existe déjà avant de coder.
9. Implémenter Domain avant Infrastructure.
10. Utiliser local providers.
11. Ajouter server authorization.
12. Ajouter validation Zod.
13. Ajouter tests.
14. Comparer visuellement si une référence existe.
15. Mettre à jour la traçabilité.

INTERDIT :

- réduire la feature pour gagner du temps ;
- inventer une règle métier depuis une maquette ;
- ignorer une exigence du cahier ;
- créer un QR comme remplacement de l'invitation ;
- coder un pack comme produit technique distinct ;
- coder un moteur par type d'événement ;
- connecter un vrai provider avant sa session ;
- déclarer une feature terminée sans tests ;
- modifier silencieusement une règle du cahier.
