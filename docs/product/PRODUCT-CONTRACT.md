# Product Contract

Ce document définit la stratégie produit globale de MyEvent's.

## Source de Vérité Canonique

La roadmap produit canonique est le **carrousel UI/UX de 47 écrans** présent dans le repository (`docs/myevents/MyEvents-carrousel.html`).

## Hiérarchie des Décisions

1. **CARROUSEL 47 ÉCRANS** : Roadmap produit, parcours, wording, architecture de l'information, UX/UI de référence, prix visibles, responsive.
2. **ds.css / lib.js / s-\*.js / fonts / PNG** : Vérité détaillée du Design System et des compositions visuelles.
3. **Architecture actuelle du rebuild** : Implémentation locale-first (Core, use cases, provider contracts, local adapters, tenant isolation).
4. **WCAG 2.2 / OWASP / Next.js** : Garde-fous minimums. Renforcent le produit mais n'inventent pas silencieusement de nouvelles features.

## Règles Majeures

- **Local-First** : Même règles métier, mêmes schémas, mêmes entitlements, mêmes composants et mêmes tests de domaine. Seuls les adapters changent en mode connecté.
- **Pricing** :
  - Invitation digitale : 14,99 €
  - Invitation + Photo/Vidéo : 29,99 €
  - Invitation + Photo/Vidéo + Audio : 39,99 €
    (Paiement unique par événement, pas d'abonnement).
