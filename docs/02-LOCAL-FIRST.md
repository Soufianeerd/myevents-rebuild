# 02 Local-First

**Règle absolue** : Pendant toute la première partie du développement, le produit doit pouvoir fonctionner sans aucune API externe ni clé secrète.

Sont INTERDITS jusqu'à instruction explicite :

- Supabase réel ou Cloud
- Stripe réel
- Resend / Postmark
- n8n
- OpenAI / Gemini API
- API Maps / API d'images
- Stockage cloud
- Analytics externe
- Webhook réel
- Toute clé API réelle

Le passage local → production ne devra pas nécessiter de réécrire l'UI ou le domaine métier.
L'application doit démarrer simplement avec `APP_MODE=local` dans le `.env.example`.
