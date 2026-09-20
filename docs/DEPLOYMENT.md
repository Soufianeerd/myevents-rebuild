# Déploiement MyEvents — Vercel Preview + Neon

Procédure actuelle au 20 septembre 2026, DEC-DEP-002. La cible Supabase est
remplacée par Neon. Le provider Supabase reste dans le dépôt pour compatibilité ;
il ne doit pas être sélectionné pour ce déploiement.

## Ressources existantes

- GitHub : `Soufianeerd/myevents-rebuild`, branche `codex/neon-migration`.
- Vercel : `myevents`, équipe `el-rhadis-projects`, Hobby,
  projet `prj_8sjulsc7LAEwb1F3EObeXD6VG7y3`. Aucun déploiement vérifié.
- Neon : projet `twilight-mode-52723515`, base `myevents`, branche
  `migration-staging` (`br-steep-firefly-b1trn4br`). Ne pas utiliser `main`.
- Les 39 tables source ont été restaurées et vérifiées ; le schéma applicatif
  contient 1 profil, 1 espace et 2 événements historiques. Détails et sauvegardes
  privées dans [NEON-MIGRATION](./NEON-MIGRATION.md).

## Authentification et récupération du compte

Lancer `corepack pnpm dev:neon`, puis ouvrir
`http://localhost:3300/inscription`. Le propriétaire utilise son adresse
historique et saisit le code reçu **dans l'application**, jamais dans le chat.
Neon exige une adresse confirmée. Une correspondance d'e-mail ne suffit pas à
rattacher les anciennes données.

Après confirmation, sélectionner explicitement les identifiants source et Neon,
puis exécuter `corepack pnpm migration:bind:identity --plan` avec les deux UUID et
le répertoire privé de sauvegarde. Contrôler le résultat avant `--apply` avec les
mêmes arguments. Le script refuse une identité non confirmée, une adresse
différente ou un autre profil déjà attribué. Ne jamais copier les anciens hashes
ou désactiver la confirmation pour débloquer la migration.

## Configuration Vercel Preview

La CLI Vercel demande une reconnexion lors du contrôle du 20 septembre : lancer
`npx vercel login` dans un terminal interactif et s'authentifier dans le navigateur.
Ne pas transmettre de token dans la conversation. Lier le projet existant ; ne
pas recréer un projet ni activer de plan payant.

Définir les variables suivantes dans **Preview seulement** :

| Variable                  | Configuration                                                                    |
| ------------------------- | -------------------------------------------------------------------------------- |
| `APP_MODE`                | `connected`                                                                      |
| `CONNECTED_PROVIDER`      | `neon`                                                                           |
| `APP_URL`                 | Origine HTTPS exacte et stable de la Preview, sans chemin                        |
| `DATABASE_URL`            | Connexion Neon poolée, base `myevents`, rôle restreint `myevents_app`, TLS       |
| `NEON_AUTH_BASE_URL`      | Endpoint Auth de la branche `migration-staging`, terminé par `/myevents/auth`    |
| `NEON_AUTH_COOKIE_SECRET` | Secret aléatoire privé d'au moins 32 caractères, stable entre les redéploiements |

Les valeurs de `.env.neon.local` sont destinées au serveur local : remplacer
`APP_URL` et générer un secret de cookie dédié à la Preview. Les fichiers
`.env.neon.local` et `.env.migration.local` restent privés, ignorés et en mode
`0600`. Ne jamais utiliser la connexion propriétaire comme connexion applicative.

Ajouter l'origine exacte de la Preview aux domaines approuvés de Neon Auth,
sans wildcard global. Conserver les domaines préexistants. Déployer en Preview,
jamais avec `--prod`. La première attribution d'URL peut demander un second
déploiement pour aligner `APP_URL` et les retours de réinitialisation.

`vercel.json` fournit les commandes pnpm et désactive les déploiements de `main`.
L'application refuse le mode local sur Vercel et refuse `VERCEL_ENV=production`.
Ces verrous restent en place. Aucun fallback JSON n'existe en mode connecté.

## Vérifications avant ouverture de la Preview

1. Exécuter `corepack pnpm check:full` : build, traces sans secrets, types, lint,
   contrats produit, isolation, tests unitaires/intégration et navigateur.
2. Tester inscription et confirmation réelles, connexion/déconnexion et reset
   avec des comptes de test autorisés. Vérifier ancien mot de passe, lien expiré
   et révocation de session. Le test SQL distant ne prouve pas l'envoi d'e-mails.
3. Vérifier la reprise des deux événements historiques et le CRUD entre deux
   utilisateurs : aucune lecture ou modification inter-tenant.
4. Vérifier cookies et redirections HTTPS, protection de la Preview et 404 de
   `/dev/mailbox` sans et avec connexion.
5. Redéployer et retrouver les mêmes comptes et événements. Consigner la preuve,
   sans identifiants secrets ni données personnelles.

### Contrôles déjà réalisés

Le 20 septembre : `check:full` **147 tests réussis**, SQL Neon distant **1 réussi**,
UI connectée anonyme/OTP et Axe **1 réussi**. Le test distant exige une connexion
**directe** à la branche autorisée dans `NEON_TEST_DATABASE_URL`. Le helper
`targetConnection` de `scripts/migration/prepare-application.mjs` valide cette
cible et transforme la connexion poolée. Toutes les fixtures sont annulées.

Le parcours avec e-mail, le rattachement propriétaire, la Preview et la
persistance après redéploiement restent à vérifier. La configuration seule
n'est pas une preuve de déploiement.

## Périmètre restant

Les médias applicatifs, Stripe Test, emails transactionnels, Sentry et PostHog
ne sont pas actifs. Aucun objet Storage source n'était à migrer. Ne pas annoncer
le stockage média disponible avant les contrôles d'accès, MIME, taille et quotas.
Le Studio, le RSVP, le commerce et le print restent des livraisons fonctionnelles
à réaliser. La production et Stripe Live restent verrouillés jusqu'au parcours
complet validé et à l'autorisation de mise en production.
