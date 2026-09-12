# Progression MyEvents vers la première vente

Mis à jour le 13 septembre 2026. Ce suivi ne remplace ni le cahier des charges ni le registre de décisions.

## Terminé

- Phase 0 : inventaire du dépôt et des routes, diagnostic domaine/providers/UI, lancement isolé, audit visuel desktop/mobile, comparaison avec le carrousel et les références personnelles/concurrentes.
- Recherche ciblée des ressources GitHub, inventaire des outils actifs et proposition d'installations limitées.
- Diagnostic documenté avec preuves : [audit Phase 0](./audit/PHASE-0-2026-09-13.md), [ressources externes](./audit/EXTERNAL-RESOURCES-2026-09-13.md), [validation](./audit/VALIDATION-2026-09-13.md).

## En cours

- Aucun développement fonctionnel engagé pendant la Phase 0. Le diagnostic est livré avant la refonte ou les nouvelles fonctionnalités, conformément à la demande.

## Bloqué pour une première vente

- Détail événement en 404 et autres défauts R0 ; funnel commercial, renderer/Studio, RSVP, commerce, médias, print/admin et adapters de production absents.
- Prix standalone/composition des offres, durée des droits, périodicité du stockage et paramètres print à finaliser dans les sessions commerciales. Sources contradictoires consignées ; aucune valeur modifiée.
- Compte/projet staging et production à rattacher lors de la session adapters. Aucun secret ni compte de production nécessaire pour commencer R0/R1/R2.
- Usage GSAP dans l'éditeur visuel à clarifier avant adoption ; le modèle d'animation peut avancer indépendamment du moteur.

## Prochain

**R0 — Rendre fiable le socle Auth/Event existant** : params Next asynchrones, modification d'événement, validation/labels, reset, protection mailbox, banc E2E isolé et tests multi-tenant. Ensuite R1 catalogue/capabilities local, R2 invitation/Studio/RSVP, R3 paiement/adapters test, R4 souvenirs, R5 print/admin, R6 acquisition/release. Détails et critères dans l'audit.

## Dette technique

- README et matrices visuelles partiellement obsolètes ; les tests de contrat vérifient surtout les artefacts de référence.
- Référentiels de données locales sans transaction inter-collections ni coordination multi-processus.
- Navigation et contexte sidebar de démonstration ; UI non équivalente aux références.
- Suite WebKit absente, E2E fortement liés au port 3000 et au répertoire `.data-e2e`, délais sensibles à la charge de la machine.
- Configuration environnement et déploiement incomplète ; `.env.example` local actuellement ignoré par Git.

## Décisions prises pendant cet audit

- Respect de PRODUCT-SPEC et DEC-ARC-001 : TenantId frontière technique, Workspace entité métier.
- Aucune modification de règle produit, de prix, de dépendance ou de provider réel.
- Données d'audit hors `.data`, aucun arrêt du serveur de l'autre projet sur 3000.
- Aucun message externe, RSVP de production, paiement ou upload pendant les inspections de références.
- Le chemin R0–R6 est une **proposition de séquencement**, pas une nouvelle décision propriétaire approuvée.

## Revenue Gate

**NON ATTEINT.** L'inscription et la création/liste d'événements sont observables localement. Les 19 étapes requises ne sont pas encore réalisables de bout en bout. Une suite technique verte à elle seule ne permettra pas de changer ce statut.
