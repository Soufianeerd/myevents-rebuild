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
