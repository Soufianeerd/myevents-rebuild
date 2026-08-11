# SESSION 01 — DESIGN SYSTEM PIXEL-PERFECT

## Objectif

Créer le Design System (tokens et primitives) de MyEvent's sans aucun écran métier, de manière accessible (WCAG 2.2 AA), pixel-perfect par rapport aux maquettes (carrousel HTML), et strictement local-first.

## Décisions & Exécution

1. **Radix UI Ciblé** : Seuls `@radix-ui/react-dialog` (pour `Dialog` et `Drawer`) et `@radix-ui/react-tooltip` ont été installés pour garantir un haut niveau d'accessibilité (Focus trap, portals). Le reste est du HTML natif (Select, Checkbox, Switch, Radio).
2. **Local-First & Polices** : `next/font/google` a été rejeté. Le build ne télécharge rien. Une stack locale de fallback est préparée via les variables `--font-*`.
3. **Tokens Strictes** : Les valeurs exactes du fichier `MyEvents-carrousel.html` ont été converties en tokens Tailwind 4 (Bordeaux, Doré, Neutres chauds).
4. **Catalogue & Tests** : Création de la page modulaire `/design-system` (dans `src/features/design-system`). Tests E2E avec Playwright, `@axe-core/playwright` (zéro violation critique/sérieuse), et un golden screenshot (`toHaveScreenshot`). Tests unitaires via Vitest.

## Statut

Session 01 terminée et figée. Le design system de base est complet, testé, accessible et validé visuellement.
