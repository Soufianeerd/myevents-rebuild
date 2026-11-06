# Product Spec Traceability

Cette matrice trace les capacités produit de haut niveau (P0/P1/P2) aux sessions de développement.

Préparation technique DEC-DEP-002 / RULE-017, 14 septembre 2026 : sauvegarde SQL
complète et restauration de 39 tables sur Neon staging **verified** (comptages et
SHA-256 des lignes). Implémentations : `scripts/migration/backup-source.mjs` et
`scripts/migration/restore-source-staging.mjs`. Tests :
`tests/integration/server/SourceBackupConfig.test.ts`,
`tests/integration/server/SourceBackupProcess.test.ts`,
`tests/integration/server/SourceRestorePlan.test.ts`. Preuves et limites dans
[NEON-MIGRATION](../NEON-MIGRATION.md). Cette vérification ne valide ni la reprise
Neon Auth ni l'export client RULE-017 complet. Cette première phase ne modifiait pas l'interface.

Adapter DEC-DEP-002, 15 septembre : schéma `myevents`, reprise de 2 événements et
isolation RLS **verified sur Neon**. Repositories/SDK testés, confirmation OTP
responsive et accessible **verified**, extension GAP-016. Reprise du compte et
parcours Auth avec e-mail en attente ; statut produit global inchangé.
[Preuves](../audit/NEON-ADAPTER-2026-09-15.md).

Accueil, 20 septembre : première présentation responsive **implémentée**,
CTA vers le parcours Auth/Event, FAQ et navigation clavier testés. Les exigences
PROD-01-001/002/004 restent partielles ; PROD-01-003 est couvert par
`tests/e2e/home.test.ts`. La landing commerciale complète reste à livrer.
[Comparaison et limites](../audit/HOME-2026-09-20.md).

| Spec Section | Capability               | Priority | Domain Objects      | UI Reference | UI Gap   | Roadmap Session | Implementation Status            | Tests | Notes                                                                                                                                                  |
| ------------ | ------------------------ | -------- | ------------------- | ------------ | -------- | --------------- | -------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| §84 #1       | Landing page             | P0       |                     | 01 / image 7 |          |                 | Partial                          |       |                                                                                                                                                        |
| §84 #2       | Catalogue produits/packs | P0       | Product, Pack       |              |          | 06              | Planned                          |       |                                                                                                                                                        |
| §84 #3       | Création de compte       | P0       | User                |              |          | 04              | implemented_unverified / partial |       | R0 verified local ; adapter Neon testé, OTP UI verified ; reprise Auth réelle en attente. Voir docs/audit/NEON-ADAPTER-2026-09-15.md                   |
| §84 #4       | Gestion d'événements     | P0       | Workspace, Event    |              |          | 05              | implemented_unverified / partial |       | R0 CRUD verified local ; données et RLS verified sur Neon ; parcours connecté complet et wizard en attente. Voir docs/audit/NEON-ADAPTER-2026-09-15.md |
| §84 #5       | Studio d'invitation      | P0       | Invitation, Section |              |          | 11-25           | Planned                          |       |                                                                                                                                                        |
| §84 #6       | Bibliothèque modèles     | P0       | Template            |              |          | 07              | Planned                          |       |                                                                                                                                                        |
| §84 #7       | Invitation par lien      | P0       | PublishedSnapshot   |              |          | 12              | Planned                          |       |                                                                                                                                                        |
| §84 #8       | RSVP personnalisable     | P0       | RSVPForm, Field     |              |          | 27              | Planned                          |       |                                                                                                                                                        |
| §84 #9       | Gestion des invités      | P0       | Guest, Group        |              |          | 26, 28-30       | Planned                          |       |                                                                                                                                                        |
| §84 #10      | QR Audio                 | P0       | QRCode, AudioMsg    |              |          | 34, 36          | Planned                          |       |                                                                                                                                                        |
| §84 #11      | QR Photo / Vidéo         | P0       | QRCode, MediaAsset  |              |          | 34, 38          | Planned                          |       |                                                                                                                                                        |
| §84 #12      | Gestion des médias       | P0       | MediaSpace          |              |          | 35, 39          | Planned                          |       |                                                                                                                                                        |
| §84 #13      | Mode privé/collab        | P0       | MediaSpace          |              | GAP-005  | 41              | Planned                          |       |                                                                                                                                                        |
| §84 #14      | Export ZIP               | P0       |                     |              | GAP-006  | 43              | Planned                          |       |                                                                                                                                                        |
| §84 #15      | Quotas stockage          | P0       | StorageQuota        |              | GAP-003  | 35              | Planned                          |       |                                                                                                                                                        |
| §84 #16      | Paiement                 | P0       | Order, Payment      |              |          | 44, 45          | Planned                          |       |                                                                                                                                                        |
| §84 #17      | Profil                   | P0       | User                |              |          | 48              | Planned                          |       |                                                                                                                                                        |
| §84 #18      | Cartes remerc.           | P0       | PrintProduct        |              | GAP-007  | 49-55           | Planned                          |       |                                                                                                                                                        |
| §84 #19      | Commandes phys.          | P0       | Order               |              | GAP-007  | 49-55           | Planned                          |       |                                                                                                                                                        |
| §84 #20      | Back-office              | P0       |                     |              | GAP-008+ | 56-62           | Planned                          |       |                                                                                                                                                        |

## Complément du 21 septembre 2026 — accueil éditorial

| Exigence                                  | État du périmètre livré                                      | Implémentation et preuves                                                                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §5 démonstrations                         | verified — démonstrations uniquement (154 tests, voir audit) | Trois démos publiques `/modeles/[slug]`, couverture commune `src/components/invitations/InvitationCover.tsx`, tests `tests/e2e/home.test.ts`, audit `docs/audit/HOME-EDITORIAL-2026-09-21.md` |
| §5 galerie ; PROD-04-001 (aperçu partiel) | Partiel                                                      | Trois modèles ouvrables sur l’accueil ; filtres, favoris, bibliothèque complète et personnalisation non livrés                                                                                |
| PROD-01-002/003                           | Partiel (direction artistique et CTA)                        | Photographies réelles, navigation modèles, CTA création existant ; textes adaptés à l’instruction visuelle du propriétaire, fonctionnalités futures signalées                                 |

## Vérification métier partielle — 22 septembre 2026

§7–23, §30–36, §40 : **verified sur le sous-parcours testé**, sans validation globale de ces sections. Document Studio → publication → RSVP propriétaire et QR → dépôt photo → réception → carte recto/verso persistante. Preuves : [BUSINESS-2026-09-22](../audit/BUSINESS-2026-09-22.md), tests de domaine, RLS PostgreSQL et navigateur cités dans ce rapport. Les exigences manquantes restent ouvertes. La priorité donnée par le propriétaire à la construction métier est exécutée par un mode de démonstration de staging sans faux paiement ; Stripe et emails ne bloquent plus ce parcours.

### Extension métier — 22 septembre 2026

- §22 / GUEST-23-001..004, GUEST-24-001 : carnet manuel, recherche/filtres, groupes/foyers, CSV avec mapping/aperçu/dédoublonnage et export sécurisé implémentés. Domaine `core/guests`, adaptateurs local/Neon, UI `/events/[id]/invites`. Tests unitaires CSV/doublons et intégration RLS/conflits réussis. Couverture **partielle**, Excel et invitations individualisées encore ouverts.
- §24–29 : organisation multi-types, tâches, budget, prestataires, lieux/programme, notes et synthèse événement implémentés ; `core/planning`, `/events/[id]/organisation`, migration 0007. Calculs en centimes, intégrité des lieux, isolation tenant et révisions vérifiés par tests unitaires/intégration. Couverture **partielle**, les exports, documents et finitions des écrans restent ouverts.

### §23 — invitation individuelle (23 septembre 2026)

Sous-parcours **verified** : émission d’un lien par contact du propriétaire, accès invité prérempli, limite d’accompagnants, réponse actualisable et rattachement CRM. Évidences : migration 0009, `bindGuestResponse`, `NeonExperience.test.ts` (isolation, limite, mise à jour unique, suspension/suppression), `experience.test.ts` (parcours navigateur complet), audit métier. GAP-002 reste partiel : un lien de foyer comportant plusieurs fiches nominatives et les envois externes ne sont pas couverts.

### §10 / §34 / §45 — images personnelles (23 septembre 2026)

Sous-parcours **verified** : import de photo propriétaire dans une section image, sauvegarde par référence, publication, lecture invitée, confidentialité du brouillon et séparation des souvenirs collaboratifs. Évidences : migration 0010, `ImageUpload`, `validateInvitationImages`, `NeonExperience.test.ts`, `experience.test.ts`, audit et capture Studio. La personnalisation globale, les fonds vidéo, le recadrage et la gestion complète de bibliothèque restent partiels.

### Galerie privée et stockage — 27 septembre 2026

§32, §34–35, §52–53 / RULE-011, RULE-013, RULE-016 : sous-parcours **verified**
en local. Galerie propriétaire filtrable, favoris, aperçu accessible, modération
multiple et téléchargement contrôlé ; comptage par catégorie et alertes
75/90/100 %. Isolation RLS testée via PGlite. `check:full` : 185 tests réussis.
Voir [GALLERY-2026-09-27](../audit/GALLERY-2026-09-27.md) pour les preuves et la
comparaison au carrousel. Conformité graphique complète, ZIP, extension du quota,
notifications et validation connectée restent ouverts.

### Clarification produit — 29 septembre 2026

DEC-PROD-001 à 006 : règles approuvées et documentées dans
[CLARIFICATION-2026-09-29](./CLARIFICATION-2026-09-29.md), **sous-parcours alignés et vérifiés localement**. Nouveau tarif du stockage, partage invité photo/vidéo
uniquement, produits indépendants et espace souvenirs commun, carte PDF autonome
ou impression sur demande, détails Studio et correspondance foyer/relance.
Les validations historiques ne prouvent pas la conformité à ces nouvelles règles.
Les implémentations et leurs limites sont détaillées ci-dessous.

### Implémentation des clarifications — 29 septembre 2026

| Référence                | Périmètre vérifié                                                                          | État global / suite                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| CLA-29-02 / §7–20        | Calendrier ICS, compte à rebours, dress code, musique importée publiée et accès aux assets | Studio partiel ; carte automatique, animations détaillées et conformité visuelle ouvertes |
| CLA-29-03 / §20–23       | Foyer dérivé du champ configuré, anciennes colonnes, refus exclus des relances             | Préparation des relances seulement ; membres de foyer et envoi automatique ouverts        |
| DEC-PROD-002 / CLA-29-06 | Rejet du partage invité audio dans core, local, Neon et SQL ; accès dépôt conservé         | Règle verified local + PGlite ; migration distante non exécutée                           |
| DEC-PROD-004 / CLA-29-07 | Carte indépendante, PDF autonome et demande de matériau immuable                           | PDF et demande verified local ; faisabilité/devis/commande/livraison à compléter          |
| CLA-29-08 / §48          | Noms du profil, isolation du compte et affichage du stockage                               | Sous-parcours verified ; profil complet et achat de stockage ouverts                      |

Preuves : [COHERENCE-PRODUIT-2026-09-29](../audit/COHERENCE-PRODUIT-2026-09-29.md).
Exigences atomiques ajoutées sans changer les identifiants existants : SEND-33-002
(PDF autonome) et PROD-35-005 (noms du profil). Les descriptions anciennes mal
rattachées à certains écrans ne servent pas à revendiquer leur conformité.

### Export, catalogue et photographies — 30 septembre 2026

- §54, RULE-016/017 et PROD-35-004 : export ZIP complet ou sélection, fichiers originaux et données CSV/JSON, contrôles d'accès et lecture en flux vérifiés localement. [Audit et limites](../audit/EXPORT-CATALOGUE-2026-09-30.md). §55 et les transferts de plusieurs Go en connecté restent à valider.
- §3–4, RULE-003/004/015 : montants du catalogue de test rattachés aux [sources commerciales retrouvées](./COMMERCIAL-SOURCES.md), refus du checkout sans prix, offre deux QR sans invitation représentée. Catalogue administrable de production non déclaré terminé.
- §1/5 : photographies réelles henné/entreprise sur la landing, crédits et droits d'usage référencés ; responsive et accessibilité couverts par les E2E de l'accueil.

### Foyers et correspondance RSVP — 30 septembre 2026

CLA-29-03, DEC-PROD-006 et §20–23 : gestion nominative des foyers/groupes,
rattachement explicite des réponses du lien général, retrait de foyer
persistant et relances tenant compte des réponses associées. Implémentation
et preuves : [FOYERS-2026-09-30](../audit/FOYERS-2026-09-30.md).
Sous-parcours **verified** localement, GUEST-25-002 ; lien commun et réponse collective de foyer,
envois externes et conformité globale des écrans restent ouverts.
