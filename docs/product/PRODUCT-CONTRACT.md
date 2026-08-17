# Product Contract

Ce document définit la stratégie produit globale de MyEvent's.

## CANONICAL PRODUCT/UX SOURCE

- **docs/myevents/MyEvents-carrousel.html** (Carrousel de 47 écrans)
- **docs/myevents/s-\*.js** (Métadonnées des écrans et composants)
- **docs/myevents/ds.css** (Design System)
- **docs/myevents/lib.js** (Composants et patterns UX transversaux)

Ces fichiers dictent la roadmap produit, les parcours, le wording, l'architecture de l'information, l'UX/UI de référence, les prix visibles et le responsive.

## TECHNICAL CONSTRAINTS

- Architecture actuelle du rebuild : Implémentation locale-first (Core, use cases, provider contracts, local adapters, tenant isolation).
- Pas de base de données distante en local-first.

## EXTERNAL NORMATIVE CONSTRAINTS

- **WCAG 2.2 AA** : Standard minimum pour l'accessibilité.
- **OWASP** : Standard minimum pour la sécurité (ex: Scrypt).
- **Next.js** : Garde-fous techniques (App Router, Server Actions).

## Règles Majeures

- **Local-First** : Même règles métier, mêmes schémas, mêmes entitlements, mêmes composants et mêmes tests de domaine. Seuls les adapters changent en mode connecté.
- **Pricing** :
  - Invitation digitale : 14,99 €
  - Invitation + Photo/Vidéo : 29,99 €
  - Invitation + Photo/Vidéo + Audio : 39,99 €
    (Paiement unique par événement, pas d'abonnement).
