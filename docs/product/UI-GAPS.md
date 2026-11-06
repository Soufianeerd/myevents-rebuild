# UI Gaps

Chaque gap de design doit être défini avant son implémentation finale.

| id      | productSection             | P0/P1/P2 | coverage | relatedExistingScreens | status          | targetSession | notes                                                    |
| ------- | -------------------------- | -------- | -------- | ---------------------- | --------------- | ------------- | -------------------------------------------------------- |
| GAP-001 | Onboarding / Services      | P0       | PARTIAL  | 12a-d                  | DESIGN_REQUIRED | 10            | Onboarding étape Services incomplète                     |
| GAP-002 | Invitation foyer/invité    | P0       | MISSING  |                        | DESIGN_REQUIRED | 30            | Invitation individualisée                                |
| GAP-003 | Gestion stockage (alertes) | P0       | MISSING  |                        | DESIGN_REQUIRED | 46            | Alertes 75/90/100%                                       |
| GAP-004 | Achat StorageAddon         | P0       | MISSING  |                        | DESIGN_REQUIRED | 46            |                                                          |
| GAP-005 | Paramètres collaboratif    | P0       | MISSING  |                        | DESIGN_REQUIRED | 41            | Délai de publication                                     |
| GAP-006 | Export ZIP                 | P0       | PARTIAL  | 31                     | VERIFIED_LOCAL  | 43            | Complet/sélection, CSV/JSON ; charge connectée à mesurer |
| GAP-007 | Flux commande physique     | P0       | MISSING  |                        | DESIGN_REQUIRED | 49-55         | Format, matériau, aperçu, paiement...                    |
| GAP-008 | Back-office Users          | P0       | MISSING  |                        | DESIGN_REQUIRED | 56            |                                                          |
| GAP-009 | Back-office Events         | P0       | MISSING  |                        | DESIGN_REQUIRED | 56            |                                                          |
| GAP-010 | Back-office Products       | P0       | MISSING  |                        | DESIGN_REQUIRED | 57            |                                                          |
| GAP-011 | Back-office Packs          | P0       | MISSING  |                        | DESIGN_REQUIRED | 57            |                                                          |
| GAP-012 | Back-office Templates      | P0       | MISSING  |                        | DESIGN_REQUIRED | 58            |                                                          |
| GAP-013 | Back-office Print          | P0       | MISSING  |                        | DESIGN_REQUIRED | 59            |                                                          |
| GAP-014 | Back-office Storage        | P0       | MISSING  |                        | DESIGN_REQUIRED | 61            |                                                          |
| GAP-015 | Back-office Payments       | P0       | MISSING  |                        | DESIGN_REQUIRED | 62            |                                                          |

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

## Clarifications du propriétaire du 29 septembre 2026

Lire [CLARIFICATION-2026-09-29](./CLARIFICATION-2026-09-29.md) et DEC-PROD-001 à 006.

- GAP-004 : achat de stockage à 1,49 € par Go supplémentaire, avec 3 Go initiaux par compte ; périodicité encore à préciser.
- GAP-005 : les réglages privé/collaboratif concernent la photo/vidéo uniquement. Aucun contrôle ne doit proposer une galerie audio partagée aux invités.
- Souvenirs : espace commun audio et photo/vidéo avec parties utilisables selon les achats, y compris sans invitation digitale. Les écrans 31 et 32 ne doivent pas imposer deux produits ou parcours indépendants dans la navigation.
- Studio : blocs facultatifs et extensibles (dont dress code), opacité du fond, identité libre ; un/deux lieux avec aperçu cartographique et itinéraire, plus de deux lieux avec noms/horaires cliquables. Musique importée et sources externes souhaitées à étudier.
- GAP-002 : le champ foyer du RSVP doit produire un rattachement exploitable dans la liste des invités. La relance montre les destinataires sans réponse, sans y inclure ceux ayant refusé.
- GAP-007 : ajouter une sortie PDF sans commande d’impression et un parcours de demande de matériau avec validation de faisabilité. L’éditeur de carte est utilisable sans invitation MyEvents ; reprise du thème possible si une invitation existe.

Ces précisions définissent le comportement attendu. Elles ne valent pas validation
visuelle ni déclaration de fonctionnalité déjà implémentée.

## État d’implémentation — 29 septembre 2026

- GAP-002 reste partiel : champ foyer relié aux réponses individuelles, sans
  gestion nominative complète d’un foyer ; préparation de relances sans envoi.
- GAP-005 : interdiction du partage invité audio mise en œuvre à toutes les
  frontières ; paramètres photo/vidéo conservés. Migration distante encore à faire.
- GAP-007 : export PDF autonome et demande de matériau persistante développés ;
  back-office de faisabilité, devis, paiement et livraison encore ouverts.
- GAP-004 : tarif corrigé dans le profil ; achat non activé, périodicité attendue.
- Studio : contrôles de fonds, opacité, typographie, calendrier, compte à rebours,
  dress code et musique ajoutés. Les ouvertures ont une transition commune ; les
  animations spécialisées restent ouvertes. Carte géographique importée seulement.

Comparaison carrousel et captures :
[COHERENCE-PRODUIT-2026-09-29](../audit/COHERENCE-PRODUIT-2026-09-29.md). Les statuts
historiques DESIGN_REQUIRED ne constituent pas une description exhaustive de ces
sous-parcours ; aucune conformité visuelle globale n’est revendiquée.

## Extension foyers — 30 septembre 2026

GAP-002 : cartes nominatives, regroupement/renommage/dissolution et association
explicite des RSVP généraux développés. Style inspiré de l’écran 25 et adapté
au carnet existant. Le lien commun et la réponse collective d’un foyer restent
ouverts ; aucun contact principal ni envoi externe simulé. Voir
[FOYERS-2026-09-30](../audit/FOYERS-2026-09-30.md).
