# Progression MyEvents vers la première vente

Mis à jour le 13 septembre 2026. Ce suivi ne remplace ni le cahier des charges ni le registre de décisions.

## Terminé

- Phase 0 : inventaire du dépôt et des routes, diagnostic domaine/providers/UI, lancement isolé, audit visuel desktop/mobile, comparaison avec le carrousel et les références personnelles/concurrentes.
- Recherche ciblée des ressources GitHub, inventaire des outils actifs et proposition d'installations limitées.
- Diagnostic documenté avec preuves : [audit Phase 0](./audit/PHASE-0-2026-09-13.md), [ressources externes](./audit/EXTERNAL-RESOURCES-2026-09-13.md), [validation](./audit/VALIDATION-2026-09-13.md).
- R0 : correctifs Auth/Event, formulaires accessibles, édition et suppression, dates par fuseau, protection mailbox et tests multi-tenant. [Rapport et captures R0](./audit/R0-VALIDATION-2026-09-13.md).
- Adapters Supabase Auth/Event/Workspace, migrations PostgreSQL avec RLS et bucket privé, configuration Vercel Preview et refus du stockage JSON en mode connecté. [Procédure de déploiement](./DEPLOYMENT.md).
- Banc E2E sur build de production, port dédié et données temporaires. Correction du lint des rapports générés, de la course de navigation et des cibles tactiles de 8 px.

## En cours

- Déploiement Preview persistant en préparation. Socle R0 validé : `pnpm check:full` réussit (12 tests produit, 2 architecture, 67 unitaires, 24 intégration, 14 E2E = 119). Build connecté Preview avec valeurs factices réussi ; 18 manifestes serveur contrôlés sans données locales ni fichiers d’environnement.

## Bloqué pour une première vente

- Funnel commercial, renderer/Studio, RSVP, commerce, médias et print/admin encore absents. Les adapters Supabase du socle sont écrits mais leur fonctionnement distant reste à vérifier.
- Prix standalone/composition des offres, durée des droits, périodicité du stockage et paramètres print à finaliser dans les sessions commerciales. Sources contradictoires consignées ; aucune valeur modifiée.
- Vercel : connexion propriétaire disponible depuis la reprise, création du projet en préparation. Supabase : CLI authentifiée disponible, aucun projet MyEvents existant ; région Paris et plan staging à confirmer. Aucun déploiement ni migration distante réalisé ; aucun autre projet modifié.
- Usage GSAP dans l'éditeur visuel à clarifier avant adoption ; le modèle d'animation peut avancer indépendamment du moteur.

## Prochain

**Déployer et vérifier le socle en Preview** après connexion Vercel, création de Supabase staging et configuration Auth/SMTP. Exécuter `pnpm test:staging` puis vérifier les parcours réels et la persistance après redéploiement. Développement suivant : R1 catalogue/capabilities local, R2 invitation/Studio/RSVP, R3 paiement/adapters test, R4 souvenirs, R5 print/admin, R6 acquisition/release. Détails et critères dans l'audit.

## Dette technique

- README et couverture visuelle partiellement obsolètes ; matrices mises à jour pour R0 avec chemins de preuve et limites explicites. Les tests de contrat ne remplacent pas les tests du parcours réel.
- Référentiels de données locales sans transaction inter-collections ni coordination multi-processus.
- Navigation et contexte sidebar de démonstration ; UI non équivalente aux références.
- Suite WebKit absente ; Chromium couvre desktop/mobile et clavier, mais aucune équivalence Safari n'est annoncée.
- SMTP, refresh/révocation GoTrue, Storage distant et persistance après redéploiement non vérifiés. Bucket préparé sans autorisation d'upload tant que les validations médias ne sont pas implémentées.
- Tokens d'espacement personnalisés à surveiller : certaines classes Tailwind numériques correspondent à des pixels différents de l'échelle par défaut. Les menus et marges mobiles du socle sont corrigés.

## Décisions prises pendant cet audit

- Respect de PRODUCT-SPEC et DEC-ARC-001 : TenantId frontière technique, Workspace entité métier.
- DEC-DEP-001 : cible Vercel + Supabase approuvée par le propriétaire après l'audit. Dépendances Supabase et PGlite ajoutées pour les adapters et tests. Aucune règle commerciale ou aucun prix modifié.
- Données d'audit hors `.data`, aucun arrêt du serveur de l'autre projet sur 3000.
- Aucun message externe, RSVP de production, paiement ou upload pendant les inspections de références.
- Le chemin R0–R6 reste une proposition de séquencement ; il ne modifie aucune exigence du cahier des charges.

## Revenue Gate

**NON ATTEINT.** L'inscription et la création/liste d'événements sont observables localement. Les 19 étapes requises ne sont pas encore réalisables de bout en bout. Une suite technique verte à elle seule ne permettra pas de changer ce statut.
