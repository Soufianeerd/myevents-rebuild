# Migration MyEvents de Supabase vers Neon

État au 13 septembre 2026 : préparation, **aucune donnée source exportée ou migrée**.

## Périmètre autorisé

Le propriétaire demande de récupérer l'intégralité du projet Supabase
`cipzwuurweaeohgxzeti` et de passer à Neon. Offre gratuite uniquement, sans activation
de facturation. Vercel `myevents` reste la cible applicative en Preview ; production
et Stripe Live restent verrouillés. Les données source doivent rester disponibles
pendant l'export, les essais de restauration et la validation.

Cette demande remplace la cible Supabase de DEC-DEP-001. Le code R0 connecté reste
actuellement un adapter Supabase : il n'est pas encore compatible Neon.

## Accès et ressources constatés

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
