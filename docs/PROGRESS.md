# Progression MyEvents vers la première vente

Mis à jour le 6 novembre 2026. Le cahier et les décisions du propriétaire restent les sources fonctionnelles. Aucun pourcentage global de livraison n'est déduit du nombre de tests.

## Version disponible

[Préversion MyEvents](https://myevents-staging-el-rhadis-projects.vercel.app), déploiement Preview `dpl_EUVexBbWJ2AZXUsucBwLpsiizXUs` du 1er octobre. Il contient les changements du workspace validé, y compris les clarifications du 29 septembre et les foyers/rattachements RSVP. La vente en production reste fermée.

- `corepack pnpm test:product` et `corepack pnpm check:full` réussis : **221 tests** (12 produit, 2 architecture, 119 unitaires, 63 intégration, 25 E2E), build réussi, 41 traces serveur sans données privées.
- Migrations Neon `0001`–`0016` appliquées sur `migration-staging`, après sauvegarde privée. RLS et absence de données accessibles anonymement revérifiées.
- Stockage distant réellement testé : dépôt signé, promotion, lecture en flux, intégrité, accès signé, refus anonyme et suppression des seuls objets de test.
- Pages publiques et nouveaux assets HTTP 200 ; dashboard protégé ; boite de développement inaccessible en ligne. Photographies chargées et absence de débordement à 390/1440 px, sans erreur JavaScript.

## Fonctions développées et vérifiées localement

| Espace               | Disponible dans le code déployé                                                                                                                                                                | Limites restantes                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Accueil              | Présentation universelle, photographies réelles créditées, modèles interactifs, FAQ, responsive                                                                                                | Pages commerciales et SEO complets, conditions de vente                                                              |
| Compte / événements  | Inscription, connexion, récupération, création et gestion de plusieurs événements                                                                                                              | Parcours Neon avec confirmation e-mail et rattachement du compte historique                                          |
| Studio / invitation  | Blocs facultatifs, styles, images/logo/fonds/opacité, dress code, calendrier, compte à rebours, lieux et itinéraires, musique importée et lecteurs externes, publication par lien              | Composition avancée, bibliothèque et ouvertures détaillées, génération des aperçus cartographiques                   |
| Invités / RSVP       | Formulaire dynamique, réponses positives et négatives, imports CSV/Excel, liens personnels, foyers/groupes nominatifs, rattachement explicite des réponses, exports et préparation de relances | Lien collectif par foyer, vrais envois et suivi, rôles de collaboration                                              |
| Organisation         | Tâches, budget, prestataires, lieux, programme, notes, pièces jointes référencées                                                                                                              | Finitions avancées et validation du parcours connecté                                                                |
| Souvenirs            | QR audio et photo/vidéo, dépôt, quotas, modération, favoris, galerie privée/collaborative photo/vidéo, audio privé                                                                             | Rétention, nettoyage des objets orphelins, notifications                                                             |
| Export               | ZIP complet ou sélection ; médias originaux, invitations JSON, invités/RSVP CSV/JSON, organisation, achats, carte et demandes enregistrées                                                     | Charge de plusieurs Go en hébergement, reprise/traitement en arrière-plan, parcours dédié télécharger puis supprimer |
| Carte / impression   | Carte indépendante, thème, images et QR sous droits, PDF recto/verso, demande immuable de faisabilité du matériau                                                                              | Devis fournisseur, acceptation, paiement, fabrication et livraison                                                   |
| Profil / stockage    | Noms, usage du compte, 3 Go inclus, tarif documenté de 1,49 €/Go affiché, historique des achats                                                                                                | Profil complet, achat de stockage et périodicité configurable, conservation                                          |
| Catalogue / paiement | Produits distincts et packs, deux QR sans invitation, montants documentés rétablis en test, refus de payer une offre sans prix                                                                 | Catalogue administrable, Stripe Test et webhook réels, factures, validation des prix de production                   |
| Administration       | Fondations de données et demandes de matériau persistées                                                                                                                                       | Back-office opérateur complet, supervision et exercice des droits                                                    |

Les tests locaux utilisent des données isolées et des providers locaux/PGlite. Le déploiement du code n'est pas une preuve de tous ces parcours avec une session Neon réelle.

## Lot du 6 novembre 2026

- Travail du 23 septembre au 1er octobre commité (4 commits) puis trois lots ajoutés sur `codex/neon-migration`.
- **Tarifs publics** `/tarifs` générés depuis le catalogue ; grille proposée DEC-PROD-007 (`PROPOSED`, test uniquement) pour photo/vidéo seul 19,99 €, invitation + audio 24,99 €, deux QR 27,99 € ; stockage proposé en achat ponctuel.
- **Pages légales** `/mentions-legales`, `/cgv`, `/confidentialite`, liées depuis l'accueil ; SIRET, adresse, contact, médiateur et durée de conservation affichés « à compléter » (variables `LEGAL_*`).
- **Checkout** : acceptation des CGV et renonciation au droit de rétractation (L221-28) obligatoires, horodatage transmis à Stripe.
- **En-têtes de sécurité** globaux : CSP, `nosniff`, `X-Frame-Options`, `Permissions-Policy` (micro autorisé pour le livre audio).
- **Back-office** `/admin` (404 hors liste `OPERATOR_EMAILS`) : totaux, commandes, demandes d'impression et étapes (devis envoyé → accepté → fabrication → expédiée / refusée) ; le client voit l'étape et la note sur sa page Cartes. Migration `0017_operator` appliquée sur `migration-staging` ; secret opérateur généré dans `.env.operator.local` (0600), hash en base.
- **Stripe Test** prêt à brancher : `dev:neon` charge `.env.payments.local` (clés Live refusées), webhook couvert par tests. Procédure : [STRIPE-TEST.md](./STRIPE-TEST.md).
- `corepack pnpm check:full` : **240 tests** réussis (12 produit, 2 architecture, 125 unitaires, 64 intégration, 37 E2E), build inclus.

## Prochaines étapes pour la première vente

1. Valider le parcours connecté avec deux comptes confirmés : création, publication, RSVP, médias privés, PDF et ZIP. Rattacher explicitement l'identité historique après confirmation.
2. Renseigner les clés Stripe Test selon [STRIPE-TEST.md](./STRIPE-TEST.md) puis vérifier Checkout + webhook sur la Preview.
3. Valider ou corriger DEC-PROD-007, compléter les informations légales (`LEGAL_*`). Restent à développer : achat de stockage, relances effectivement envoyées, paiement du devis d'impression.
4. Achever les écarts du Studio et des invités, les conditions commerciales/légales, la conservation des données, la supervision et les contrôles navigateur supplémentaires.
5. Exécuter le Revenue Gate avant l'ouverture de la vente. **Revenue Gate non atteint.**

## Preuves et sources

- [Clarifications et écarts fonctionnels](./audit/COHERENCE-PRODUIT-2026-09-29.md).
- [ZIP, catalogue, photographies et tests](./audit/EXPORT-CATALOGUE-2026-09-30.md).
- [État connecté et mises à jour de staging](./audit/CONNECTED-READINESS-2026-09-30.md).
- [Foyers, rattachements RSVP et preuves](./audit/FOYERS-2026-09-30.md).
- [Tarifs retrouvés dans les Markdown et maquettes](./product/COMMERCIAL-SOURCES.md).
- [Historique des premières étapes jusqu'au 21 septembre](./audit/PROGRESS-HISTORY-2026-09-21.md).
