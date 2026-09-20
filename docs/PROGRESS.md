# Progression MyEvents vers la première vente

Mis à jour le 20 septembre 2026. Ce suivi ne remplace ni le cahier des charges ni le registre de décisions.

## Terminé

- Phase 0 : inventaire du dépôt et des routes, diagnostic domaine/providers/UI, lancement isolé, audit visuel desktop/mobile, comparaison avec le carrousel et les références personnelles/concurrentes.
- Recherche ciblée des ressources GitHub, inventaire des outils actifs et proposition d'installations limitées.
- Diagnostic documenté avec preuves : [audit Phase 0](./audit/PHASE-0-2026-09-13.md), [ressources externes](./audit/EXTERNAL-RESOURCES-2026-09-13.md), [validation](./audit/VALIDATION-2026-09-13.md).
- R0 : correctifs Auth/Event, formulaires accessibles, édition et suppression, dates par fuseau, protection mailbox et tests multi-tenant. [Rapport et captures R0](./audit/R0-VALIDATION-2026-09-13.md).
- Adapters Supabase Auth/Event/Workspace, migrations PostgreSQL avec RLS et bucket privé, configuration Vercel Preview et refus du stockage JSON en mode connecté. [Procédure de déploiement](./DEPLOYMENT.md).
- Banc E2E sur build de production, port dédié et données temporaires. Correction du lint des rapports générés, de la course de navigation et des cibles tactiles de 8 px.
- Sauvegarde PostgreSQL complète du projet source puis restauration de 39 tables sur Neon `migration-staging`. Comptages et SHA-256 des lignes concordants, 13 policies métier présentes, contraintes/index et séquence contrôlés. [Preuves et limites](./NEON-MIGRATION.md).
- Validation de cette reprise : `pnpm check:full` réussi, 129 tests (12 produit, 2 architecture, 67 unitaires, 34 intégration, 14 E2E). Le premier timeout E2E d'inscription ne s'est pas reproduit lors de la relance complète.

- Schéma applicatif Neon et adapters Auth/Event/Workspace implémentés. Les 2 événements, le profil et l'espace sont repris ; RLS testée sur Neon, formulaire OTP contrôlé sur desktop/mobile et avec Axe. [Rapport Neon](./audit/NEON-ADAPTER-2026-09-15.md).

## Validation du 20 septembre 2026

- `corepack pnpm check:full` réussi sur les changements Neon : **147 tests** (12 produit, 2 architecture, 80 unitaires, 39 intégration, 14 E2E), formatage, lint, TypeScript et build inclus. Les 19 manifestes serveur ne contiennent ni données locales ni secrets.
- Test SQL distant relancé sur `migration-staging` : **1/1 réussi**, isolation entre deux utilisateurs, expiration/révocation et rollback des fixtures. Premier lancement arrêté avant toute connexion par le garde-fou de cible : URL poolée fournie au lieu de la connexion directe ; relance avec `targetConnection` existant.
- Test navigateur connecté : **1/1 réussi**, formulaire OTP desktop/mobile, accessibilité Axe et redirection anonyme. Ces tests ne prouvent pas la réception des e-mails ni un parcours authentifié complet.
- Connecteur Neon opérationnel : branche de staging et configuration Auth relues. CLI Vercel 59.23.2 : session expirée, reconnexion nécessaire. Aucun déploiement effectué.
- Application connectée lancée sur `http://localhost:3300/inscription` pour la confirmation du propriétaire. Le rattachement historique reste en attente.
- Les 16 images reçues le 20 septembre complètent les références visuelles. Le texte joint reste une analyse de contexte : ses prix, quotas et promesses ne remplacent pas le contrat produit.

- Accueil de préparation réalisé et comparé aux images desktop/mobile : illustration d'invitation, palette ivoire/bordeaux, polices locales, FAQ clavier, liens fonctionnels. [Preuves](./audit/HOME-2026-09-20.md).
- Après cette livraison, `corepack pnpm check:full` réussit à nouveau : **149 tests** (12 produit, 2 architecture, 80 unitaires, 39 intégration, 16 E2E). Aucun échec ; build et 19 manifestes serveur vérifiés.

## En cours

- Migration applicative Supabase vers Neon (DEC-DEP-002, gratuit uniquement). Les données source sont récupérées et vérifiées sur `migration-staging` à Francfort. Neon Auth est actif et l'adapter connecté par défaut utilise Neon. Le compte historique attend son nouvel accès confirmé et un rattachement explicite ; les parcours avec e-mail restent à valider. [État et procédure](./NEON-MIGRATION.md).
- Socle R0 antérieur validé : `pnpm check:full` réussit (12 tests produit, 2 architecture, 67 unitaires, 24 intégration, 14 E2E = 119). Build connecté Preview avec valeurs factices réussi ; 18 manifestes serveur contrôlés sans données locales ni fichiers d’environnement.

## Bloqué pour une première vente

- Funnel commercial, renderer/Studio, RSVP, commerce, médias et print/admin encore absents. Le socle Neon est écrit et son isolation SQL distante vérifiée ; les parcours Auth réels restent à compléter.
- Prix standalone/composition des offres, durée des droits, périodicité du stockage et paramètres print à finaliser dans les sessions commerciales. Sources contradictoires consignées ; aucune valeur modifiée.
- Vercel `myevents` créé vide sur Hobby ; aucun déploiement. Supabase `myevents-staging` créé gratuitement à Paris avant le changement de cible, sans migration appliquée. Accès PostgreSQL source validé, sauvegarde privée disponible et Neon staging restauré. La reprise Auth et les tests connectés de bout en bout restent nécessaires avant Vercel Preview.
- Usage GSAP dans l'éditeur visuel à clarifier avant adoption ; le modèle d'animation peut avancer indépendamment du moteur.

## Prochain

**Confirmer le nouvel accès du compte existant**, effectuer son rattachement explicite, puis vérifier connexion/reset, CRUD authentifié et persistance après redéploiement avant Vercel Preview. Compléter l'inventaire des configurations hors PostgreSQL. Aucun objet Storage source à transférer ; les fonctionnalités médias restent dans leurs sessions prévues. Développement suivant : R1 catalogue/capabilities local, R2 invitation/Studio/RSVP, R3 paiement/adapters test, R4 souvenirs, R5 print/admin, R6 acquisition/release. Détails et critères dans l'audit.

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
- DEC-DEP-002 remplace la cible Supabase par Neon à la demande du propriétaire ; récupération de l'existant préalable, budget gratuit uniquement, pas de facturation.
- Données d'audit hors `.data`, aucun arrêt du serveur de l'autre projet sur 3000.
- Aucun message externe, RSVP de production, paiement ou upload pendant les inspections de références.
- Le chemin R0–R6 reste une proposition de séquencement ; il ne modifie aucune exigence du cahier des charges.

## Revenue Gate

**NON ATTEINT.** L'inscription et la création/liste d'événements sont observables localement. Les 19 étapes requises ne sont pas encore réalisables de bout en bout. Une suite technique verte à elle seule ne permettra pas de changer ce statut.
