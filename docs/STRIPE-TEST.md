# Brancher Stripe Test — procédure (6 novembre 2026)

Le code de paiement est prêt : Checkout Stripe, webhook signé, activation idempotente par `myevents.fulfill_order` et refus systématique du mode Live. Il ne manque que les secrets. Rien ne doit être collé dans le chat ni commité.

## 1. Récupérer les clés (5 minutes, dans le dashboard Stripe)

1. Ouvrir dashboard.stripe.com, basculer sur **Mode test** (interrupteur en haut à droite).
2. Développeurs → Clés API → copier la **clé secrète** `sk_test_…` (ou créer une clé restreinte `rk_test_…` avec Checkout Sessions en écriture).
3. Développeurs → Webhooks → Ajouter un endpoint :
   - URL : `https://myevents-staging-el-rhadis-projects.vercel.app/api/stripe/webhook`
   - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`
   - Copier le **secret de signature** `whsec_…`.

## 2. Local (`corepack pnpm dev:neon`)

Compléter `.env.payments.local` (permissions `0600`, déjà ignoré par Git) :

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...        # celui de `stripe listen` en local
PAYMENT_FULFILLMENT_SECRET=...          # déjà présent
```

`scripts/run-neon-local.mjs` charge désormais ce fichier et refuse toute clé qui n'est pas en mode test. Pour recevoir le webhook en local : `stripe listen --forward-to localhost:3300/api/stripe/webhook`.

## 3. Preview Vercel

```
vercel env add STRIPE_SECRET_KEY preview
vercel env add STRIPE_WEBHOOK_SECRET preview
vercel env add PAYMENT_FULFILLMENT_SECRET preview
```

Le hash SHA-256 de `PAYMENT_FULFILLMENT_SECRET` doit correspondre à la ligne `payments` de `myevents.service_secrets` sur `migration-staging` ; utiliser la même valeur que `.env.payments.local` et vérifier cette correspondance avant le premier paiement. Redéployer ensuite la Preview.

## 4. Vérification attendue

1. Sur un événement, page **Offres** : cocher l'acceptation des CGV / renonciation, cliquer « Payer avec Stripe Test ».
2. Carte `4242 4242 4242 4242`, date future, CVC quelconque.
3. Retour sur Offres : « Paiement de test confirmé », service affiché « Déjà activé ».
4. Dans Stripe → Webhooks : livraison HTTP 200. Une seconde livraison du même événement reste sans effet (idempotence).

Couverture automatisée : `tests/unit/server/StripeWebhook.test.ts` (signature, falsification, Live refusé, relance en cas d'échec) et `tests/integration/experience/NeonExperience.test.ts` (activation SQL et montant contrôlé).

## Passage en Live

Interdit tant que le Revenue Gate n'est pas validé et que DEC-PROD-007 n'est pas approuvé. Le code refuse `sk_live_` ; ce verrou doit être levé par une décision explicite, pas par configuration.
