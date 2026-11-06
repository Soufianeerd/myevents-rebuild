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

La CLI Vercel a été reconnectée le 20 septembre, et le projet existant est lié au
dépôt GitHub. En cas d’expiration ultérieure, lancer `npx vercel login` dans un
terminal interactif et s’authentifier dans le navigateur.
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

Les variables sont configurées uniquement pour Preview. `APP_URL` explicite est
prioritaire. Sans cette valeur, l'application peut utiliser `VERCEL_BRANCH_URL`,
ou `VERCEL_URL` pour un premier lancement CLI, uniquement sur Vercel Preview et
pour un hôte `.vercel.app` valide. Aucun Host de requête n'est utilisé.
Source : [variables système Vercel](https://vercel.com/docs/environment-variables/system-environment-variables).

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

Le 20 septembre, après accueil et origine Preview : `check:full` **150 tests réussis**, SQL Neon distant **1 réussi**,
UI connectée anonyme/OTP et Axe **1 réussi**. Le test distant exige une connexion
**directe** à la branche autorisée dans `NEON_TEST_DATABASE_URL`. Le helper
`targetConnection` de `scripts/migration/prepare-application.mjs` valide cette
cible et transforme la connexion poolée. Toutes les fixtures sont annulées.

La Preview a été déployée avec succès (commit `d6982b9`, déploiement `dpl_7g1gnhFGDJB7cgCJoroAESG9dmF1`) et son alias est https://myevents-staging-el-rhadis-projects.vercel.app. Le parcours avec e-mail, le rattachement propriétaire et la persistance après redéploiement restent à vérifier.

## Périmètre restant au 20 septembre (historique)

Les médias applicatifs, Stripe Test, emails transactionnels, Sentry et PostHog
ne sont pas actifs. Aucun objet Storage source n'était à migrer. Ne pas annoncer
le stockage média disponible avant les contrôles d'accès, MIME, taille et quotas.
Le Studio, le RSVP, le commerce et le print restent des livraisons fonctionnelles
à réaliser. La production et Stripe Live restent verrouillés jusqu'au parcours
complet validé et à l'autorisation de mise en production.

## Mise à jour du 30 septembre 2026

Déploiement Preview `dpl_BA7rDsAZBRf6XBusWMGKoZcuoVpR`, état `READY`, depuis le workspace local validé, sans nouveau commit ni déploiement Production. URL immuable : https://myevents-idfrh8xzm-el-rhadis-projects.vercel.app. L'alias stable https://myevents-staging-el-rhadis-projects.vercel.app pointe maintenant vers ce déploiement. Aucun changement d'origine Auth/CORS nécessaire.

Validation : 211 tests locaux réussis, build Vercel réussi, 41 traces serveur contrôlées. Le dry-run de déploiement comprend 291 fichiers et exclut les `.env*`, données locales, sauvegardes, docs et rapports de tests. Neon staging est aligné sur les migrations `0001`–`0016` ; sauvegarde et contrôles post-migration documentés dans `docs/audit/CONNECTED-READINESS-2026-09-30.md`.

Contrôles après déploiement : accueil, connexion, inscription et nouvelles photographies HTTP 200 ; dashboard et routes privées d'export/PDF redirigés vers l'authentification en accès anonyme ; `/dev/mailbox` HTTP 404. L'accueil a été inspecté au navigateur en 390 et 1440 px, toutes images chargées, sans débordement ni erreur JavaScript. Les captures sont dans `docs/audit/export-2026-09-30/`.

Les fonctions Studio, RSVP, médias, cartes et ZIP sont désormais dans cette Preview. Le parcours authentifié Neon, les transferts de plusieurs Go, Stripe Test, les envois réels et le traitement opérateur des commandes restent à valider/compléter. Voir `docs/PROGRESS.md` pour le périmètre actuel ; les paragraphes historiques précédents ne décrivent plus l'intégralité des capacités livrées. Production et Stripe Live restent verrouillés.

## Mise à jour du 1er octobre 2026 — foyers et RSVP

Preview `dpl_EUVexBbWJ2AZXUsucBwLpsiizXUs`, état READY, workspace local validé
avec 221 tests (12 produit, 2 architecture, 119 unitaires, 63 intégration, 25
E2E). Déploiement immuable : https://myevents-fz5yzn2jm-el-rhadis-projects.vercel.app.
L’alias stable pointe vers cette version. 296 fichiers livrés, build distant
réussi, aucune migration supplémentaire. Les secrets et données locales sont
toujours exclus du déploiement.

L’appel initial sans scope a renvoyé « Not authorized » malgré une session
valide. Cibler explicitement l’équipe liée au projet pour ces commandes :
`vercel deploy --target preview --scope el-rhadis-projects --yes`, puis
`vercel alias set <URL-Preview-validée> myevents-staging-el-rhadis-projects.vercel.app --scope el-rhadis-projects`.
Ne pas employer `--prod` : le verrou de vente reste actif.

Contrôles HTTP après déploiement et détail fonctionnel :
[FOYERS-2026-09-30](./audit/FOYERS-2026-09-30.md). Aucun nouveau commit ni push
inclus dans cette livraison manuelle.
