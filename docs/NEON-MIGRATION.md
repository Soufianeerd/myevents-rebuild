# Migration MyEvents de Supabase vers Neon

État au 15 septembre 2026 : **sauvegarde complète, 39 tables restaurées et
schéma applicatif Neon en place**. Les adapters Auth/Event/Workspace sont
branchés et testés. La reprise du compte existant nécessite son nouvel accès
Neon confirmé, puis un rattachement explicite. Les parcours Auth avec e-mail et
le déploiement Preview restent à valider.

## Adapter applicatif du 15 septembre

- `0001_application.sql` et `0002_legacy_import.sql` appliqués uniquement sur
  `migration-staging` : 1 profil, 1 espace et 2 événements dans `myevents`.
  Empreintes des 39 tables historiques inchangées après copie.
- Neon Auth actif, confirmation e-mail par code obligatoire avec l'expéditeur
  partagé gratuit. Interface de confirmation, SDK serveur, repositories Drizzle,
  rôle `myevents_app` limité et RLS avec validation de la session.
- `corepack pnpm dev:neon` lance le mode connecté sur le port 3300 à partir du
  fichier privé `.env.neon.local`. Les scripts de sauvegarde/migration continuent
  à utiliser `.env.migration.local`, avec la connexion propriétaire distincte.
- Le compte source reste sans rattachement Neon jusqu'à confirmation du nouvel
  accès par le propriétaire. Le script `migration:bind:identity` vérifie les deux
  UUID explicites et les adresses confirmées avant toute association.
- [Rapport, tests, captures et limites](./audit/NEON-ADAPTER-2026-09-15.md).
  Aucun envoi d'e-mail ni basculement production réalisé par les tests.

## Reprise du 14 septembre

- Le navigateur est connecté au compte `Soufianeerd` et accède au projet source
  `myevents`, dans `Soufianeerd's Org`, région Irlande (`eu-west-1`). Cet accès
  navigateur ne change pas les credentials de la CLI, qui visaient un autre compte.
- SQL en lecture seule : PostgreSQL **17.6**, base de **11 693 203 octets** au moment
  du contrôle ; **2 événements, 2 sous-événements, 1 organisation, 1 appartenance,
  1 compte Auth email et 1 identité**. Les trois tables privées `audit_logs`, `jobs`
  et `webhook_events` sont vides. Aucun bucket, objet Storage ou secret Vault.
- Six migrations applicatives existent, du 21 au 22 juillet 2026 : schémas/enums,
  tenancy/events, infrastructure interne, contraintes/index/triggers, helpers/RLS,
  protection et bootstrap du propriétaire. Leur résultat JSON et les données métier
  ont d'abord été lus en mémoire via le SQL Editor. Ils sont désormais conservés
  dans l'archive PostgreSQL durable et restaurés dans la branche de staging.
- Source et rebuild ont des schémas différents : source `organizations`,
  `organization_memberships`, `events(title,event_date,organization_id,created_by,...)`
  et `sub_events(starts_at,ends_at,position,...)`. Ne pas écraser ces relations avec
  les migrations R0 `profiles/workspaces/events`.
- Projet Neon **myevents**, ID `twilight-mode-52723515`, PostgreSQL 17, Francfort,
  créé dans l'organisation Free. Branche par défaut `main` :
  `br-empty-bonus-b1xdamy1`. Branche de travail **migration-staging** :
  `br-steep-firefly-b1trn4br`. La base `myevents` de staging contient désormais
  les 39 tables récupérées ; `main` n'a pas été modifiée. Accès Object Storage
  confirmé actif sur la branche, région `eu-central-1`. Aucune facturation activée.
- Le réseau du poste ne joint pas la connexion IPv6 directe. Le tableau de bord
  fournit le **session pooler IPv4 gratuit**, hôte
  `aws-0-eu-west-1.pooler.supabase.com`, port **5432**, utilisateur
  `postgres.cipzwuurweaeohgxzeti`, base `postgres`. Aucun addon IPv4 payant requis.
- Le fichier local ignoré `.env.migration.local`, en `0600`, contient maintenant
  l'accès source fourni par le propriétaire et la connexion Neon de staging.
  La connexion PostgreSQL source a été validée par le dump réel en lecture seule.
  PostgreSQL client 18.3 existe sous
  `/opt/homebrew/opt/libpq/bin`, contrairement au client 14 par défaut trop ancien.

### Sauvegarde exécutée et contrôlée

`pnpm migration:backup:source` utilise ce fichier privé. Le script refuse un autre
projet, le transaction pooler, l'absence de TLS ou un mot de passe manquant. Il ouvre
une transaction source en lecture seule, exporte un snapshot PostgreSQL et utilise
**le même snapshot pour les comptages et pg_dump**. Tous les schémas sont inclus.
Le dump custom, la table des matières et le manifeste SHA-256 sont conservés en
permissions privées sous `~/.local/share/myevents/migrations/`, hors du dépôt.

Le script ne restaure rien et ne modifie aucune donnée source. Une erreur laisse
un état incomplet et un diagnostic privé ; elle ne produit pas de manifeste de
réussite. Le code de sortie zéro atteste la création de l'archive, pas la réussite
de la migration. Les fichiers Storage et la configuration hors base restent des
volets séparés, même si le comptage Storage source est actuellement nul.

Archive du 14 septembre à 14:34 UTC : **345 288 octets**, SHA-256
`3d343153f538e2160cd894711607ca65203aa782654f5b3cffadfbc5cf812470`.
Le dossier privé est
`~/.local/share/myevents/migrations/2026-09-14T14-34-22.278Z-8d6ee1ff-115b-4e96-8c66-e851c8b40461/`.
Il contient `source.dump`, `contents.txt` et `manifest.json`.

Le premier essai a révélé que passer une URI dans `PGDATABASE` faisait interpréter
l'URI comme un nom de base locale. Le script utilise maintenant les paramètres
libpq séparés (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGSSLMODE`).
Les tests vérifient cette connexion au niveau des processus, le snapshot partagé,
les permissions, le SHA-256 et le refus d'une archive incomplète ou d'un client trop ancien.

### Restauration de staging vérifiée

`pnpm migration:restore:staging --plan <dossier-privé>` produit la sélection et les
empreintes attendues sans connexion distante. `--apply` cible exclusivement
l'endpoint direct de `migration-staging`, refuse une base déjà occupée, puis
restaure en une transaction avec arrêt à la première erreur.

- **392 entrées restaurées, 39 tables** dans `auth`, `public`, `private`, `storage`
  et `supabase_migrations`, avec les extensions `pgcrypto` et `uuid-ossp`.
- **228 entrées exclues de la restauration**, conservées dans l'archive complète
  et listées dans `neon-excluded.txt` : ACL/owners Supabase et composants de service
  Realtime, GraphQL, PgBouncer, Vault, event triggers et instrumentation.
- Les comptages et SHA-256 des lignes COPY, triées sans perte de doublons,
  correspondent pour les **39 tables**, y compris les tables Auth et de migrations.
  Les 2 événements, 2 sous-événements, 1 organisation, 1 appartenance et 1 compte
  source sont présents. Les anciens enregistrements de sessions sont conservés
  comme données historiques ; ils ne constituent pas des sessions Neon Auth.
- Les **13 policies métier** et la RLS des quatre tables métier sont présentes.
  Aucun index ni aucune contrainte invalide. La séquence Auth vérifiée correspond
  à l'archive : `last_value=6`, `is_called=true`.
- Le rôle `authenticated` est `NOLOGIN`, sans privilège sur les tables métier/Auth.
  Les accès PUBLIC aux schémas, tables, séquences et fonctions restaurés sont
  révoqués. Ces données ne sont pas encore exposées à l'application.
- Preuves privées : `neon-restore-plan.json`, `neon-selection.txt`,
  `neon-excluded.txt`, `neon-restore.sql`, `neon-restore-verified.json`.

Ne pas relancer `--apply` sur cette branche déjà restaurée. Pour refaire un essai,
préparer une nouvelle branche et adapter explicitement la cible autorisée du script.
La validation ci-dessus porte sur la récupération SQL ; la configuration des
services externes, Neon Auth, les adapters applicatifs et Vercel restent en attente.

## Périmètre autorisé

Le propriétaire demande de récupérer l'intégralité du projet Supabase
`cipzwuurweaeohgxzeti` et de passer à Neon. Offre gratuite uniquement, sans activation
de facturation. Vercel `myevents` reste la cible applicative en Preview ; production
et Stripe Live restent verrouillés. Les données source doivent rester disponibles
pendant l'export, les essais de restauration et la validation.

Cette demande remplace la cible Supabase de DEC-DEP-001. Le code R0 connecté reste
actuellement un adapter Supabase : il n'est pas encore compatible Neon.

## Accès et ressources constatés le 13 septembre (historique)

| Ressource                                          | État observé                                                                                                                                                                |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase source `cipzwuurweaeohgxzeti`             | URL fournie par le propriétaire. La CLI actuellement authentifiée reçoit HTTP 403 sur l'accès administratif au projet.                                                      |
| Clé publishable source                             | Auth settings répond HTTP 200 ; API REST racine HTTP 401 ; liste de buckets visible vide. Ces résultats ne prouvent ni une base vide ni l'absence de fichiers privés.       |
| Organisation Neon `Soufiane`                       | `org-noisy-recipe-92183359`, plan `free`, aucun projet listé, y compris avec filtre d'organisation.                                                                         |
| Vercel `myevents`                                  | Projet vide créé sur le compte Hobby `el-rhadis-projects`, ID `prj_8sjulsc7LAEwb1F3EObeXD6VG7y3`. Aucun déploiement ni variable applicative configurée.                     |
| Supabase staging créé avant le changement de cible | `gxpklkqegpbcxsnfsbtc`, `myevents-staging`, Paris, Nano gratuit. CLI liée, aucune migration appliquée. Ce projet ne contient pas les données source et n'est plus la cible. |

L'accès source est indispensable : la clé publishable n'est pas une connexion
PostgreSQL et ne permet pas d'exporter Auth, les objets privés et la configuration
administrative. Se connecter au compte propriétaire via le tableau de bord source,
puis utiliser un accès administratif autorisé et une connexion PostgreSQL directe
(ou session pooler si le réseau impose IPv4). Ne pas réinitialiser un mot de passe
de base existant sans examiner les applications qui l'utilisent.

Les secrets doivent rester dans un fichier local ignoré, par exemple
`.env.migration.local` avec permissions `0600`, ou dans l'environnement du processus.
Ne pas les coller dans le chat, les commandes affichées, les preuves ou Git.

## Région et compatibilité à vérifier

La documentation Neon consultée le 13 septembre indique que le stockage et les
Functions sont disponibles en bêta à Francfort (`aws-eu-central-1`) et en Ohio.
Francfort est retenu pour garder l'environnement en Europe. Ces services sont
gratuits pendant la bêta sous quotas ; aucune fonction AI Gateway payante n'est
prévue. Les instructions locales du skill évoquant Ohio uniquement sont antérieures
à cette documentation. Vérifier aussi l'accès effectif au stockage sur la branche.

Une première requête de création de projet, incluant un délai de suspension
explicite, a été refusée par le plan gratuit. La liste de projets vérifiée après
l'erreur est vide. Pour la création effective, conserver le délai par défaut et
choisir la version PostgreSQL après inventaire de la source.

## Inventaire avant export

1. Identifier le projet, sa version PostgreSQL, sa région, son volume, ses schémas,
   extensions, tables, séquences, vues, fonctions, triggers, contraintes, rôles et
   politiques RLS. Exécuter `scripts/migration/source-inventory.sql` dans une session
   PostgreSQL administrative en lecture seule ; conserver sa sortie hors du dépôt.
2. Compter précisément les lignes par table dans un snapshot cohérent et relever
   les clés, les relations, les tenants et les identités, sans publier de données
   personnelles. Les estimations du script ne remplacent pas ces comptages.
3. Inventorier Auth : comptes, identités OAuth, MFA, fournisseurs, domaines de
   retour, SMTP et templates. Ne pas confondre sauvegarde du schéma `auth` et
   fonctionnement de ces comptes dans Neon Auth.
4. Inventorier Storage avec un accès administratif : buckets, confidentialité,
   objets, taille, type MIME, métadonnées et empreintes des octets. Une sauvegarde
   SQL du schéma `storage` ne contient pas les fichiers.
5. Inventorier les Edge Functions et leur source disponible, secrets nécessaires,
   webhooks, tâches planifiées, Realtime, domaines et intégrations. Signaler
   explicitement ce qui n'est pas récupérable depuis le compte. Ne pas exécuter les
   tâches ou envoyer de messages durant l'inventaire.

## Export et restauration de travail

- Garder les exports contenant données personnelles ou hashes Auth dans un
  répertoire privé **hors du dépôt**, avec permissions `0700` pour le répertoire et
  `0600` pour les fichiers. Conserver un manifeste des fichiers et leur SHA-256.
- Utiliser `pg_dump` au format custom, compatible avec la version source. Sauvegarder
  tous les schémas nécessaires, y compris ceux de services ; contrôler la table des
  matières avec `pg_restore --list`. Ne pas limiter silencieusement l'export à
  `public` et ne pas considérer un export partiel comme complet.
- Créer le projet Neon gratuit puis une branche `migration-staging`. Les essais
  s'effectuent sur cette branche, sans toucher à la branche par défaut.
- Restaurer une sélection inspectée avec `--no-owner --no-acl --exit-on-error`, via
  connexion directe, après analyse des extensions et dépendances Supabase. Les
  rôles système, fonctions `auth.uid()` et policies ne sont pas portables par
  simple changement d'URL. Recréer les privilèges minimaux nécessaires.
- Copier séparément les octets des fichiers vers des buckets privés Neon. Vérifier
  tailles et SHA-256 ; conserver les chemins et les relations aux objets métier.
  Préserver les règles d'accès public/privé de la source après analyse des usages.
- Comparer snapshot exporté et restauration : comptages exacts, clés uniques,
  références, séquences, contraintes et checksums des objets. Si la source continue
  à évoluer, un rapprochement final est nécessaire avant toute bascule.

## Auth et adaptation applicative

La documentation de migration de Neon indique que les mots de passe Supabase ne
sont pas directement importables dans Managed Better Auth en raison des hashes
incompatibles. Elle signale aussi des différences pour la vérification e-mail, la
modification du mot de passe et les méthodes non prises en charge (téléphone, SAML,
Web3). Ne pas effacer les comptes source ni prétendre préserver les sessions.

Après inventaire, préparer une correspondance explicite et vérifiée entre identité
source et identité cible, en préservant les relations utilisateurs/tenants/workspaces
et événements. Ne pas réattribuer les données par simple correspondance d'adresse
e-mail non vérifiée. Préparer le parcours de reprise ou de réinitialisation adapté
avant tout envoi aux utilisateurs ; aucun envoi automatique n'est autorisé ici.

Conserver Core pur et providers locaux. Implémenter l'adapter Neon derrière les
contrats existants, l'autorisation serveur, la validation Zod et des requêtes
paramétrées. Adapter RLS et stockage aux identités vérifiées côté serveur ; ne pas
exposer un rôle propriétaire ou un secret S3 au navigateur. Les exemples `todos`
fournis ne décrivent pas le schéma réel et ne doivent pas le remplacer.

## Conditions de validation

- Sauvegarde complète inspectée et restauration répétable, aucune différence
  inexpliquée dans les comptages ou checksums.
- Reprise des comptes et isolation de deux tenants vérifiées sur données de test,
  accès aux fichiers privés autorisé/refusé selon les droits attendus.
- Inscription, connexion, déconnexion, reset, confirmation, refresh de session,
  création/édition/suppression d'événements et persistance après redéploiement.
- `pnpm test:product`, `pnpm check:full`, tests connectés adaptés à Neon et
  comparaison visuelle aux écrans canoniques ; mettre à jour les preuves de
  traçabilité. Le résultat R0 de 119 tests concerne le socle antérieur à la migration.
- Configuration Vercel Preview uniquement après validation de l'adapter. Aucun
  basculement production, suppression Supabase ou activation de facturation.

## Vérifications de la préparation

Le 14 septembre 2026, après sauvegarde et restauration réelles,
`corepack pnpm check:full` réussit : format, lint, types, contrats générés,
**12 tests produit, 2 architecture, 67 unitaires, 34 intégration et 14 E2E
(129 tests)**. Les 18 manifestes du build serveur ne contiennent ni données locales
ni fichiers d'environnement. Dix tests couvrent la configuration de sauvegarde,
l'orchestration des processus et le plan de restauration. Ils complètent les
vérifications distantes décrites plus haut, sans simuler une validation Neon Auth.

Un premier passage E2E a dépassé les 10 secondes pendant l'inscription du scénario
de doublon ; le formulaire était encore en attente. La suite complète relancée
passe, y compris ce scénario, sans modification de l'application ni de son délai.
Aucune modification UI dans cette reprise ; les comparaisons visuelles existantes
du socle passent et aucune nouvelle parité avec le carrousel n'est revendiquée.

Le 13 septembre 2026, le script d'inventaire a été exécuté dans PGlite avec une
table témoin, une contrainte primaire et une policy RLS. Les catalogues et l'état
RLS sont correctement rapportés ; la ligne témoin reste intacte après le rollback.
Ce contrôle ne constitue pas un inventaire du projet Supabase distant.

`corepack pnpm check:full` réussit après exclusion des fichiers temporaires générés
par la CLI Supabase du contrôle Prettier : format, lint, types, contrats générés,
12 tests produit, 2 architecture, 67 unitaires, 24 intégration et 14 E2E (119 tests).
Aucune interface ni aucun adapter applicatif modifié dans cette préparation.

## Références officielles consultées

- [Migration PostgreSQL Supabase vers Neon](https://neon.com/docs/import/migrate-from-supabase)
- [Migration Supabase Auth vers Neon](https://neon.com/docs/auth/migrate/from-supabase)
- [Disponibilité et quotas de la bêta Neon](https://neon.com/docs/get-started/backend-beta)
