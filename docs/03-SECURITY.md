# 03 Security

Principes non négociables :

- **Validation serveur** : Ne jamais faire confiance au navigateur.
- **Authorization côté serveur** : Les vérifications de permissions se font en profondeur.
- **Isolation multi-tenant** : Les données d'un client ne fuient jamais vers un autre.
- **IDs opaques** : Utiliser des identifiants non séquentiels pour les URLs publiques.
- **Aucune donnée privée dans les URLs** publiques.
- **Secrets serveur uniquement** : Aucun secret ne doit fuiter au build ou être committé.
- **Uploads futurs** : Vérification stricte via validation serveur (MIME, taille, quotas).
- **Protection IDOR** : Insecure Direct Object References.
- **Pas de redirect arbitraire** : Whitelisting strict.
- **Webhooks futurs vérifiés** : Signature requise.
- **Opérations critiques idempotentes**.
- **Logs sains** : Sans secrets ni données sensibles.

Les futures APIs doivent suivre le flux :
`request → authentication → authorization → Zod validation → domain service → repository/provider`
