# Session 00: Bootstrap

- **Date**: 10 août 2026
- **Objectif**: Obtenir un projet Next.js propre, strict, testable et documenté servant de socle immuable.
- **Environnement détecté**: Node 22.22.3, pnpm 10.34.5.
- **Versions installées**: Next.js 16.3.0, React 19.2.8.
- **Fichiers créés**: Structure de base (app, core, providers, tests, docs), configs (Prettier, Vitest, Playwright).
- **Décisions**: Local-first strict, App Router, TypeScript strict, pas de UI complexes créées à ce stade.
- **Dépendances**: prettier, vitest, playwright, zod, @testing-library/react, @testing-library/dom, jsdom.
- **Tests**: 1 unitaire (validation de env local), 1 E2E (page d'accueil).
- **Résultats**: Toutes les commandes `pnpm check` sont au vert.
- **Limites**: Aucune logique métier pour l'instant.
- **Dette**: Aucune.
- **État Git**: Dépôt git propre avec un seul commit initial.
- **Prochaine session**: Session 01 - Design system pixel-perfect.
