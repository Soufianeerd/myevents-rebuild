# Déploiement MyEvents — Vercel Preview + Supabase Staging

Cible validée par le propriétaire le 13 septembre 2026 : projet Vercel **myevents**, dépôt **Soufianeerd/myevents-rebuild**, PostgreSQL/Auth/Storage Supabase. Aucun hébergement MyEvents n'était configuré. La production et les clés Stripe Live restent interdites jusqu'à validation du parcours complet.

## État de la livraison

Le code dispose de deux modes explicites : `local` pour développer sans réseau, `connected` pour Supabase. Le mode connecté utilise Supabase Auth et des repositories PostgreSQL protégés par RLS ; aucun User/Session/ResetToken/Event/Workspace n'est persisté en JSON dans ce mode. Aucun repli local en cas de configuration absente. Les cookies sont propres à chaque requête ; aucun client Supabase authentifié n'est partagé globalement.

Vercel refuse `APP_MODE=local`. `VERCEL_ENV=production` est également refusé jusqu'à ouverture du gate. `vercel.json` désactive les déploiements automatiques depuis main. Le build local de production utilisé par les E2E reste autorisé hors Vercel.

Cette livraison prépare le socle persistant Auth/Event. Elle ne livre pas encore Studio, catalogue, RSVP, paiements, médias, impression ou admin. Le bucket privé est préparé ; les uploads restent fermés jusqu'à implémentation des contrôles MIME/tailles/quotas. Les providers Stripe, Resend transactionnel, Sentry et PostHog viendront dans leurs tranches fonctionnelles ; ils ne sont pas présentés comme actifs.

## Accès manquants

Les connecteurs **Vercel** et **Supabase** ne sont pas disponibles dans cette session Codex. Lors de la reprise, la CLI Supabase authentifiée a permis de lister les projets de l'organisation ; aucun projet MyEvents n'est encore présent. La connexion Vercel dans le navigateur est maintenant disponible. La création du projet et de la Preview est en préparation. GitHub est accessible. Ne pas coller de clés secrètes dans la conversation.

Aucun projet distant, domaine, région, compte payant ou base de production n'a été créé implicitement. Le nom Vercel reste demandé, pas réservé.

## 1. Préparer Supabase Staging

1. Créer un projet Supabase dédié à MyEvents staging. Choisir la région et le plan dans le compte propriétaire.
2. Exécuter **dans l'ordre** les fichiers `supabase/migrations/202609130001_foundation.sql` puis `202609130002_private_storage.sql`, via SQL Editor ou Supabase CLI authentifiée. Faire cela sur une base neuve ; les scripts ne réinitialisent pas les tables existantes.
3. Vérifier : `profiles`, `workspaces`, `events` avec RLS actif ; bucket `event-assets` privé ; aucune table de mots de passe applicative. La création d'un utilisateur Auth déclenche un profil avec TenantId généré côté base, indépendant des métadonnées modifiables par l'utilisateur.
4. Auth : activer email/password, confirmation e-mail, longueur minimum de mot de passe **15**, expiration OTP **1800 secondes**, rate limits et protection contre les abus. L'application borne les mots de passe à 128 caractères. Ne pas désactiver les limites Supabase pour faire passer un test.
5. Configurer le Site URL sur une **URL Preview stable** et autoriser les URLs exactes `/auth/confirm` et `/reinitialiser-mot-de-passe`. Éviter un wildcard global sur tous les domaines Vercel.
6. Configurer SMTP personnalisé pour l'envoi aux testeurs. Resend peut fournir le SMTP si son compte/domaine expéditeur est disponible ; le mail par défaut Supabase comporte des limitations. Ne pas annoncer les emails comme opérationnels avant réception réelle.

### Templates Auth obligatoires

Confirmation de compte, lien du template :

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}"
  >Confirmer mon adresse</a
>
```

Réinitialisation, lien du template :

```html
<a href="{{ .RedirectTo }}?token={{ .TokenHash }}"
  >Choisir un nouveau mot de passe</a
>
```

L'application fixe RedirectTo selon APP_URL et ne suit aucun paramètre `next` arbitraire. Le lien de récupération transporte TokenHash : sa vérification se fait **à la soumission** et après validation du mot de passe. Il ne faut pas utiliser le template implicite par défaut à fragment `#access_token`, que cette UI ne consomme pas.

Après reset Supabase, le provider demande une déconnexion globale. Les refresh tokens sont révoqués ; la durée résiduelle des JWT d'accès dépend de Supabase. Vérifier en staging le comportement attendu de révocation et la durée des JWT avant l'ouverture à des clients.

## 2. Préparer Vercel

1. Importer `Soufianeerd/myevents-rebuild` dans Vercel, nom de projet **myevents**, racine `./`, framework Next.js, Node 22.x, pnpm 10.34.5 via Corepack.
2. Garder main comme branche de production. Déployer la branche `codex/r0-deployment-readiness` en **Preview**, sans promotion. Si l'import initial propose uniquement un déploiement production, le laisser bloqué et utiliser une Preview de cette branche après la création du projet.
3. Définir uniquement dans l'environnement **Preview** les variables ci-dessous. Une URL stable de branche ou un domaine staging permet de conserver les retours d'authentification. Une fois l'URL attribuée, aligner APP_URL et la configuration Supabase puis redéployer.
4. Conserver la protection des Preview et autoriser les testeurs concernés. Ne pas partager un contournement de protection dans le code ou Git.

| Variable                   | Valeur / provenance                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `APP_MODE`                 | `connected`                                                                                                   |
| `APP_URL`                  | Origine HTTPS exacte de la Preview stable, sans chemin, query ni credentials                                  |
| `SUPABASE_URL`             | URL du projet staging Supabase                                                                                |
| `SUPABASE_PUBLISHABLE_KEY` | Clé publishable du projet staging ; une clé legacy anon peut être utilisée si elle est encore celle du projet |

L'application n'utilise **aucune clé service_role** et refuse les clés `sb_secret_` ou JWT de rôle privilégié dans sa configuration. Les URLs APP_URL et SUPABASE_URL doivent être des origines HTTPS en production. Ne pas ajouter `LOCAL_DATA_DIR` sur Vercel. Ne pas définir manuellement les variables système VERCEL/VERCEL_ENV ni contourner le verrou de production.

Chaque build vérifie aussi les manifestes serveur `.nft.json` : aucune donnée `.data`, aucun fichier `.env*` ni rapport Playwright ne doit être embarqué. Les données locales restent intactes ; elles sont exclues des fichiers de déploiement.

Sources : [Vercel Git](https://vercel.com/docs/git), [configuration Git](https://vercel.com/docs/project-configuration/git-configuration), [environnements](https://vercel.com/docs/deployments/environments), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [templates e-mail](https://supabase.com/docs/guides/auth/auth-email-templates).

## 3. Vérifier la Preview persistante

- Inscription de deux comptes de test, réception des confirmations, connexion/déconnexion.
- Création, ouverture, modification et suppression d'événements ; date correcte Paris/Casablanca ; pas de fuite via un ID appartenant à l'autre compte, y compris une soumission d'un formulaire ouvert avant changement de session.
- Reset : mot de passe faible refusé sans consommation du lien, mot de passe valide accepté, ancien mot de passe refusé, lien non réutilisable, déconnexion des sessions testée.
- `/dev/mailbox` : 404 sans authentification ET connecté.
- Contrôle direct via SDK avec deux JWT non privilégiés des tables et du bucket : les données du second utilisateur restent inaccessibles. Les tests PostgreSQL embarqués couvrent le SQL applicatif, pas les services GoTrue/Storage distants.
- Redéployer la Preview et vérifier que les mêmes comptes et événements persistent. Vérifier cookies Secure/HttpOnly, retour des liens mail et refresh de session.
- Vérifier le réseau et les logs sans tokens, mots de passe ou données privées.

Conserver les preuves dans `docs/audit/` sans secrets. Une configuration committée ou un build avec valeurs factices n'est pas un déploiement persistant validé.

### Vérification SDK automatisée

Après création et confirmation de deux comptes **de test** dans le projet staging, `corepack pnpm test:staging` exécute un scénario de persistance et d’isolation avec la clé publishable et les JWT utilisateurs. Il exige `MYEVENTS_STAGING_TESTS=1`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `STAGING_USER_A_EMAIL`, `STAGING_USER_A_PASSWORD`, `STAGING_USER_B_EMAIL`, `STAGING_USER_B_PASSWORD` dans l’environnement du terminal. Ces identifiants ne sont jamais versionnés. Le scénario crée un événement synthétique puis le supprime logiquement ; il échoue explicitement si les accès manquent. Il ne fait pas partie de `check:full`, qui doit rester autonome et local.

## Données locales préexistantes

Les données d'audit sont synthétiques et ne doivent pas être importées dans Supabase. Les fichiers locaux ne sont ni supprimés ni transférés automatiquement. Si des données métier existent dans `.data`, prévoir un import contrôlé : inventaire, sauvegarde, création/invitation des comptes Supabase, correspondance IDs utilisateurs/tenants/workspaces et conversion des anciennes dates selon leur fuseau. Ne pas copier des hashes scrypt applicatifs dans Supabase Auth ni réassigner les identités par simple correspondance d'e-mail sans vérification.

## Exploitation et suite

La base staging doit être séparée de la future production. Toute migration suivante sera additive autant que possible, avec sauvegarde et essai de restauration avant go-live. Le rollback Vercel ne restaure pas la base. Le passage production exige le Revenue Gate, les intégrations commerciales test, l'observabilité, les informations légales/commerciales approuvées et la levée explicite du verrou dans un changement revu.
