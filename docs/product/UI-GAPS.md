# UI Gaps

Chaque gap de design doit être défini avant son implémentation finale.

| id      | productSection             | P0/P1/P2 | coverage | relatedExistingScreens | status          | targetSession | notes                                 |
| ------- | -------------------------- | -------- | -------- | ---------------------- | --------------- | ------------- | ------------------------------------- |
| GAP-001 | Onboarding / Services      | P0       | PARTIAL  | 12a-d                  | DESIGN_REQUIRED | 10            | Onboarding étape Services incomplète  |
| GAP-002 | Invitation foyer/invité    | P0       | MISSING  |                        | DESIGN_REQUIRED | 30            | Invitation individualisée             |
| GAP-003 | Gestion stockage (alertes) | P0       | MISSING  |                        | DESIGN_REQUIRED | 46            | Alertes 75/90/100%                    |
| GAP-004 | Achat StorageAddon         | P0       | MISSING  |                        | DESIGN_REQUIRED | 46            |                                       |
| GAP-005 | Paramètres collaboratif    | P0       | MISSING  |                        | DESIGN_REQUIRED | 41            | Délai de publication                  |
| GAP-006 | Export ZIP                 | P0       | MISSING  |                        | DESIGN_REQUIRED | 43            |                                       |
| GAP-007 | Flux commande physique     | P0       | MISSING  |                        | DESIGN_REQUIRED | 49-55         | Format, matériau, aperçu, paiement... |
| GAP-008 | Back-office Users          | P0       | MISSING  |                        | DESIGN_REQUIRED | 56            |                                       |
| GAP-009 | Back-office Events         | P0       | MISSING  |                        | DESIGN_REQUIRED | 56            |                                       |
| GAP-010 | Back-office Products       | P0       | MISSING  |                        | DESIGN_REQUIRED | 57            |                                       |
| GAP-011 | Back-office Packs          | P0       | MISSING  |                        | DESIGN_REQUIRED | 57            |                                       |
| GAP-012 | Back-office Templates      | P0       | MISSING  |                        | DESIGN_REQUIRED | 58            |                                       |
| GAP-013 | Back-office Print          | P0       | MISSING  |                        | DESIGN_REQUIRED | 59            |                                       |
| GAP-014 | Back-office Storage        | P0       | MISSING  |                        | DESIGN_REQUIRED | 61            |                                       |
| GAP-015 | Back-office Payments       | P0       | MISSING  |                        | DESIGN_REQUIRED | 62            |                                       |

## GAP-016 — Confirmation e-mail Neon (R0 / DEC-DEP-002)

Le service e-mail partagé gratuit de Neon exige un code OTP pour confirmer une
adresse. Les écrans Auth canoniques restent la référence pour carte, champs,
boutons, focus et erreurs ; aucun écran de saisie OTP n'est fourni. Extension
prévue : carte « Confirmer mon adresse », champs e-mail et code à six chiffres,
action de confirmation et renvoi, retour connexion. Aucun accès métier avant
confirmation. Cette adaptation technique doit être testée visuellement et en
accessibilité sans revendiquer une maquette OTP canonique.

## Références complémentaires du 20 septembre 2026

Les 16 images fournies par le propriétaire complètent le carrousel : public
(images 1, 7, 8), Auth/compte (2, 9), événements/organisation (3, 10, 11),
modèles/Studio (4, 12, 13), invités (6, 14), souvenirs (15), print/commandes
(5, 16). Elles précisent la direction visuelle et ne remplacent pas les règles
métier ni les prix du cahier. Le document joint de 74 sections est une analyse de
contexte, pas une instruction d'exécuter ses propositions ou de modifier les quotas.

La première page d'accueil reprend palette et hiérarchie ; la photographie
florale et le logo final restent à intégrer. Voir `docs/audit/HOME-2026-09-20.md`.
