# Sources des tarifs MyEvents — 30 septembre 2026

Recherche demandée par le propriétaire dans les Markdown du projet, puis recoupée avec les écrans référencés. Ce document rassemble les données existantes ; il n'ajoute aucune décision commerciale.

## Montants retrouvés

| Offre                            | Montant documenté | Source Markdown                                              | Référence d'origine                                               |
| -------------------------------- | ----------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| Invitation digitale seule        | 14,99 €           | `docs/audit/PHASE-0-2026-09-13.md`, §3, tableau des montants | `docs/myevents/s-public.js`, écran 05 ; `s-memories.js`, écran 34 |
| Invitation + Photo/Vidéo         | 29,99 €           | Même tableau                                                 | Mêmes écrans                                                      |
| Invitation + Photo/Vidéo + Audio | 39,99 €           | Même tableau                                                 | Mêmes écrans                                                      |
| Livre audio seul                 | 12,99 €           | Même tableau                                                 | `s-memories.js`, écran 34                                         |
| Carte de remerciement numérique  | 7,99 €            | Même tableau                                                 | `s-memories.js`, écran 34, éditeur et export PDF/PNG              |

L'audit Markdown qualifie ces chiffres de références de maquette. Ils remplacent désormais les montants non sourcés du **catalogue de test**. Le champ `testOnly` et le verrou Stripe Live restent en place. Le prix de la carte numérique ne constitue pas un prix d'impression physique.

Les écrans historiques indiquent un paiement unique par événement et un accès de 12 mois après l'événement (`s-public.js`, écran 05). Ils contiennent aussi d'anciens bonus de stockage et inclusions : ces éléments ne doivent pas remplacer silencieusement les clarifications du propriétaire ni devenir des règles d'expiration sans implémentation dédiée.

## Produits et packs

La clarification du 29 septembre, §3, exige les quatre produits indépendants et l'achat des deux QR sans invitation. Les packs décrits sont invitation seule, invitation + audio et invitation + audio + photo/vidéo. Le cahier §4 décrit aussi invitation + souvenirs photo/vidéo. Les packs restent des assemblages des mêmes produits techniques.

Aucun montant exact n'a été retrouvé pour photo/vidéo seul, invitation + audio, ou les deux QR seuls. Aucun tarif n'est déduit par soustraction ou addition des packs historiques. Ces offres restent visibles mais inactives au paiement tant que leur prix n'est pas configuré. La démonstration des produits reste accessible indépendamment du tarif.

## Stockage

- Règle explicite actuelle : **3 Go par compte et 1,49 € par Go supplémentaire**, `DECISION-REGISTER.md`, DEC-PROD-001, et `CLARIFICATION-2026-09-29.md`, §6.
- Les anciens montants +3 Go à 1,99 € (§52 du cahier) et +20 Go à 9,99 € (maquette) sont remplacés.
- Le cahier §52 demande une périodicité configurable (ponctuel, mensuel ou autre) et suggère le mensuel sans l'imposer. DEC-PROD-001 ne fixe pas cette périodicité. Un renouvellement automatique ne peut donc pas être ajouté comme règle approuvée.

## Impression

Le cahier §39–40 demande une tarification selon matériau, format, quantité, finition et livraison. DEC-PROD-004 ajoute une vérification de faisabilité du matériau. Le tarif numérique de 7,99 € ne permet pas de calculer le devis fournisseur ; les prix du configurateur de démonstration ne sont pas des devis de production.

## Périmètre de la recherche

Recherche dans les Markdown du dépôt, le cahier canonique, les décisions, clarifications, audits et les écrans commerciaux 05/34. L'archive utilisateur `docs/myevents/Archive.zip` a été inspectée en lecture seule : fichiers PNG/HTML, aucun Markdown et pas de montant complémentaire pour les offres ci-dessus. L'archive est conservée intacte.

La hiérarchie reste celle de `PRODUCT-CONTRACT.md` : décisions explicites ultérieures, cahier fonctionnel, puis références visuelles. Ce relevé évite de redemander les chiffres déjà documentés et de présenter un chiffre absent comme une règle métier.
