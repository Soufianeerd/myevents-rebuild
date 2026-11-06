# État des services connectés — 30 septembre 2026

Audit initial en lecture seule sur la branche Neon `migration-staging` et le projet Vercel `myevents`. Les mises à jour exécutées ensuite sont consignées en fin de document. Aucun paiement ni message envoyé. Les résultats initiaux ci-dessous complètent les historiques `DEPLOYMENT.md` et `NEON-MIGRATION.md`, dont certains paragraphes décrivent encore l'état des 15–20 septembre.

## État effectivement constaté

| Service             | Preuve observée                                                                                                                                                                                                  | Limite de la preuve                                                                                                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base Neon           | Connexion réelle avec le rôle applicatif restreint `myevents_app`, base `myevents`. Une transaction `READ ONLY` voit zéro événement et zéro profil sans identité authentifiée.                                   | Confirme la connexion et le filtrage anonyme ; ne remplace pas un scénario complet connecté avec deux utilisateurs.                                                                                     |
| Schéma de staging   | Le plan du script `extend-experience.mjs --plan` annonce les migrations `0011` à `0016` en attente. Les migrations jusqu'à `0010` sont déjà enregistrées.                                                        | La version locale récente et la base distante ne sont pas encore alignées. Le script de plan termine par `ROLLBACK`.                                                                                    |
| Neon Auth           | Configuration gérée disponible ; mot de passe et inscription activés ; `require_email_verification=true`, méthode OTP ; endpoint JWKS HTTP 200. Origine Preview stable approuvée, localhost autorisé.            | Aucun test d'envoi, réception de code, connexion ou récupération n'a été exécuté dans cet audit.                                                                                                        |
| Données historiques | Comptages SQL agrégés : 1 profil, 2 événements, 0 profil lié à Neon ; 0 utilisateur Neon Auth, donc 0 adresse Neon confirmée.                                                                                    | La récupération du propriétaire reste à faire après création et confirmation de son accès dans l'application. Aucun identifiant personnel n'est publié.                                                 |
| Stockage Neon       | Endpoint de la branche de staging en `eu-central-1`. `HeadBucket` HTTP 200 ; liste limitée à un objet accessible et vide. CORS GET/HEAD/POST autorisant la Preview stable, `localhost:3300` et `localhost:3200`. | Confirme l'accès existant au bucket et son état vide ; ne prouve pas encore le dépôt navigateur, la quarantaine, la promotion, les quotas ou l'isolation d'un fichier réel en environnement connecté.   |
| Vercel              | CLI authentifiée, projet existant accessible. L'alias stable répond HTTP 200 et pointe vers le déploiement Preview `dpl_CVHHJbr3ziakqPFpH43Dnn6XqYR7`, créé le 23 septembre 2026 à 11:38:05 UTC, état Ready.     | Les changements locaux postérieurs ne sont pas en ligne. Aucun déploiement n'est déclenché par cet audit.                                                                                               |
| Routes Preview      | `/dashboard` renvoie 307 vers `/connexion` ; `/dev/mailbox` renvoie 404 ; `/connexion` et `/confirmer-adresse` répondent 200. HSTS présent.                                                                      | Contrôle anonyme HTTP uniquement. CSP et `X-Content-Type-Options` absents dans ces réponses du déploiement du 23 septembre.                                                                             |
| Stripe              | Le connecteur interrogé dans la session du 30 septembre ne retourne que le compte **EL RHADI**, en mode Live.                                                                                                    | Aucun compte Test utilisable n'est confirmé par le connecteur actuel. L'autorisation OAuth visible précédemment ne constitue pas cette confirmation. Aucun appel financier ni basculement Live réalisé. |

## Configuration sans divulgation de valeurs

Les fichiers `.env.local`, `.env.neon.local`, `.env.migration.local`, `.env.media.local`, `.env.payments.local` et `.env.staging` existent, sont ignorés par Git et disposent des permissions `0600`.

- `.env.neon.local` contient les champs Auth/DB attendus. La connexion applicative a été testée réellement, sans afficher son URL.
- `.env.media.local` contient les accès Storage ; ils ciblent bien la branche de staging et la région européenne. `dev:neon` traduit ces noms privés vers les variables `NEON_STORAGE_*` attendues par le serveur.
- `.env.payments.local` contient `PAYMENT_FULFILLMENT_SECRET` seulement. Aucune clé Stripe Test ni signature de webhook n'y est présente.
- La liste des variables Vercel Preview contient `APP_MODE`, `CONNECTED_PROVIDER`, `DATABASE_URL`, `APP_URL`, les deux champs Neon Auth, les cinq champs `NEON_STORAGE_*` et `BUSINESS_PREVIEW`.
- Cette liste Preview ne contient ni `STRIPE_SECRET_KEY`, ni `STRIPE_WEBHOOK_SECRET`, ni `PAYMENT_FULFILLMENT_SECRET`. Le checkout réel de test et l'activation des achats ne sont donc pas prêts sur cet environnement.

La présence d'une variable Vercel n'atteste pas sa valeur, son actualité ni son injection dans un prochain déploiement. Les valeurs des secrets n'ont pas été lues dans le chat ou dans ce rapport.

## Travaux à effectuer dans l'ordre

1. Après validation locale, appliquer les migrations additives `0011`–`0016` uniquement à `migration-staging`, par le script à cible fixe, puis vérifier les versions et les politiques de données. Préserver les schémas source restaurés et la branche `main`.
2. Déployer la version validée en Preview, avec les mêmes origines Auth et CORS, et constater sa version réelle. Tester les nouveaux parcours connectés, notamment les médias et le PDF, avec preuve après redéploiement.
3. Réaliser le parcours d'inscription et confirmation du propriétaire dans l'application. Le rattachement des événements historiques reste explicite et vérifie les identités confirmées ; une correspondance d'e-mail seule ne suffit pas.
4. Obtenir un accès Stripe Test vérifié et renseigner les secrets uniquement dans les emplacements privés appropriés. Vérifier un Checkout Test et son webhook signé, puis l'attribution idempotente des produits. Les montants du catalogue actuel sont explicitement des fixtures de test ; ils ne valent pas grille tarifaire de production.
5. Vérifier les conditions de la mise en production : parcours complet client et invité, droits entre comptes, fichiers privés, commandes, tarification administrable, informations commerciales et légales, limites et supervision. Les verrous production et Stripe Live restent actifs dans le code tant que le Revenue Gate n'est pas validé.

## Commandes et contrôles reproductibles

- `node scripts/migration/extend-experience.mjs --plan` : six migrations attendues, transaction annulée.
- Connexion PostgreSQL privée avec `BEGIN READ ONLY`, uniquement agrégats et rôle effectif ; `ROLLBACK` final.
- Commandes S3 strictement en lecture : `HeadBucket`, `GetBucketCors`, `ListObjectsV2` (`MaxKeys: 1`). Aucun nom d'objet affiché.
- Neon MCP : configuration Auth avec secrets masqués et requête de comptages agrégés sur la branche explicitement nommée.
- CLI Vercel existante 59.23.2 : `whoami`, `env ls preview`, `ls myevents`, `inspect` de l'alias stable. La commande `npx --no-install vercel` n'était pas résolue ; le binaire déjà présent dans le cache npm a été utilisé sans installation.
- Requêtes HTTP GET anonymes vers la Preview et le JWKS Auth ; aucun formulaire soumis.
- Validation locale de configuration : `corepack pnpm exec vitest run tests/unit/connected-env.test.ts tests/unit/env.test.ts` — **4 tests réussis**. Les verrous Vercel connecté, production et la validation des origines sont couverts. Ce passage ne remplace pas la suite complète du lot de développement.

Attention au lanceur local : `scripts/run-neon-local.mjs` charge les fichiers Neon et Media, puis active la démonstration métier. Il ne charge pas `.env.payments.local`. Préparer ce fichier seul ne suffira donc pas à activer le paiement dans `dev:neon` ; il faudra une injection serveur explicite et privée lorsque Stripe Test sera disponible.

## Mise à jour exécutée — 30 septembre 2026

Après validation complète locale (211 tests), les migrations `0011` à `0016` ont été appliquées en une transaction par `scripts/migration/extend-experience.mjs --apply`, exclusivement sur `migration-staging`. Le plan suivant est vide. Les 16 versions sont enregistrées ; RLS reste actif sur les profils, médias et demandes de matériau. Un contrôle avec le rôle `myevents_app`, sans identité, retourne zéro événement, profil et demande accessibles. Aucun rattachement d'identité, changement de plan ni basculement sur `main` effectué.

Sauvegarde préalable du schéma applicatif au format PostgreSQL custom, `pg_dump` 18.3, vérification TLS complète, archive lisible par `pg_restore --list` (82 167 octets). Fichier privé `0600`, dossier `0700`, sous `.data/backups/staging-2026-09-30/application-pg18.dump`, ignoré par Git et exclu du déploiement. La sauvegarde couvre le schéma `myevents` modifié par ces migrations ; elle ne remplace pas la sauvegarde historique complète des schémas source.

Le stockage de staging a ensuite été testé réellement avec une photo éditoriale de 261 807 octets : POST signé en quarantaine, copie vers un nouvel objet, contrôle de taille, lecture en flux identique octet pour octet, GET signé HTTP 200 et refus de lecture anonyme. Les deux objets temporaires créés pour le contrôle ont été supprimés après le test. Aucune donnée utilisateur existante modifiée. Cela valide les opérations S3 utilisées par l'adapter ; le parcours complet avec une session Neon Auth reste à tester.

La Preview a ensuite été redéployée : `dpl_BA7rDsAZBRf6XBusWMGKoZcuoVpR`, état `READY`, depuis le workspace validé par 211 tests. L'alias stable pointe vers `myevents-idfrh8xzm-el-rhadis-projects.vercel.app`. Les nouvelles photos sont réellement servies ; pages publiques HTTP 200, dashboard et exports anonymes redirigés vers la connexion, mailbox HTTP 404. Captures et contrôles navigateur desktop/mobile dans `docs/audit/export-2026-09-30/`. Aucun paiement Stripe ni création d'utilisateur Neon pendant ce lot.
