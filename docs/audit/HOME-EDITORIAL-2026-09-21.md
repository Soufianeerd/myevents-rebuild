# Accueil éditorial et démonstrations — 21 septembre 2026

## Périmètre

Demande du propriétaire : sortir du rendu générique, employer de vraies photographies, présenter des modèles ouvrables et ajouter des animations discrètes. Références : carrousel accueil et bibliothèque, The Digital Yes et Yesday. Les enseignements portent sur la présentation du produit ; aucun asset concurrent repris.

Exigences concernées : §5 du cahier (hero, galerie d’inspiration, démonstrations), PROD-01-002/003, PROD-04-001 (aperçu, partiel). Livraison partielle du périmètre catalogue/Studio, sans changement commercial.

## Implémentation

- Accueil photographique, composition ivoire/bordeaux, typographie éditoriale et signature manuscrite ; photos locales optimisées par Next Image.
- Trois compositions HTML/CSS : Jardin lumière, Soirée grenat, Les beaux jours. Couverture partagée entre landing et page publique de démonstration.
- Démonstrations pré-rendues `/modeles/[slug]`, ouverture native au clavier, programme et lieu fictifs ; 404 pour un modèle inconnu.
- Navigation mobile par défilement horizontal de la collection ; aucun défilement horizontal du document.
- Mouvements brefs, désactivés avec `prefers-reduced-motion`. Pas d’autoplay audio, pas de collecte de données ou faux RSVP.
- Photos et licences : `docs/design/ASSET-CREDITS.md`.

## Comparaison visuelle

Captures inspectées sur desktop 1440 px et mobile 390 px : `docs/audit/evidence/home-editorial/`. Palette et hiérarchie cohérentes avec le carrousel ; ajout des photographies et cartes réellement ouvrables absentes de la précédente version. Les visuels de cette livraison sont des compositions originales, pas une reproduction pixel-perfect des images de référence.

## Validation

Captures finales prises sur le build de production local, sans erreur JavaScript observée.

Les tests E2E couvrent les liens, les trois modèles et leurs programmes, le retour à la collection, l’ouverture clavier, Axe WCAG AA, la réduction des animations, les routes inconnues et les débordements à 360/390/1440 px. Premier passage : contraste transitoire insuffisant pendant les fondus. Correction : mouvements sans fondu du texte, contraste conservé pendant l’animation.

Un passage a également rencontré un timeout de navigation dans le test cumulant trois formats. Chaque format est maintenant testé dans une page isolée ; les contrôles de débordement et Axe sont conservés. `corepack pnpm check:full` réussi : **154 tests** (12 produit, 2 architecture, 81 unitaires, 39 intégration, 20 E2E), formatage, lint, TypeScript et build inclus. Les 20 manifestes serveur ne contiennent ni données locales ni secrets. Log local : `/tmp/myevents-design-validated.log`.

## Limites explicites

Le Studio, la personnalisation persistante, la publication, le RSVP et l’achat ne sont pas implémentés par cette livraison. Les pages le précisent. Aucun prix, avis client ou compteur d’usage inventé. La validation visuelle ne constitue pas une validation du parcours commercial complet.

## Déploiement vérifié

Commit applicatif `097cbd5`, Vercel Preview `dpl_7BgtcwfTzN6g6gg7XHwCsJ3Pu8yo`, état READY. Alias https://myevents-staging-el-rhadis-projects.vercel.app réaffecté à cette version. Lecture HTTP authentifiée avec la CLI Vercel : accueil contenant les trois modèles et démonstration Soirée grenat contenant son ouverture et son programme. Aucun changement de production, aucune reconnexion Neon, aucun paiement.
