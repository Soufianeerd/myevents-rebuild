# Export des souvenirs, catalogue et accueil — 30 septembre 2026

## Périmètre livré

Le propriétaire peut télécharger une archive ZIP de son événement depuis l'espace commun des souvenirs, ou une sélection de 1 à 100 fichiers. Le téléchargement complet n'a pas la limite de 100 fichiers. Les fichiers terminés sont classés en photos, vidéos, audios et fichiers de création ; les fichiers privés restent récupérables par leur propriétaire. Les dépôts en cours et les fichiers supprimés sont exclus.

L'archive complète comprend aussi les brouillons et versions publiées de l'invitation, leur historique enregistré, les réponses RSVP CSV/JSON avec les anciens libellés, les invités/foyers CSV/JSON, l'organisation et le budget, les réglages des espaces, les achats, la carte enregistrée et les demandes de matériau. Un manifeste relie les chemins aux noms originaux et indique les dépôts en attente. Les clés de stockage, secrets de dépôt et signatures de paiement ne sont pas exportés. Le PDF reste accessible depuis l'éditeur de carte ; YouTube et Spotify restent des références externes, sans extraction musicale.

Le téléchargement ne supprime rien. Le parcours §55 « télécharger puis supprimer du cloud », avec confirmation et gestion du résultat du téléchargement, reste distinct et n'est pas déclaré terminé.

## Implémentation et exigences

- §54, RULE-016/017, GAP-006 et PROD-35-004 : domaine pur `src/core/media/export.ts`, stockage local/Neon avec lecture en flux, archive dans `src/server/media/zip.ts`, assemblage dans `src/server/media/export.ts`, route authentifiée `/events/[id]/souvenirs/export` et interface complète/sélection.
- Autorisation serveur par événement et tenant, sélection Zod, rejet global d'un identifiant inconnu/supprimé, noms de fichiers normalisés et uniques. Les CSV neutralisent les formules de tableur.
- Lecture des médias un à un, sans charger leur ensemble en mémoire ; taille attendue vérifiée par le générateur ZIP. Annulation et erreurs ferment les sources. Une source manquante interrompt le téléchargement.
- Le catalogue de test reprend les cinq montants documentés, avec provenance dans `docs/product/COMMERCIAL-SOURCES.md`. Trois offres sans montant documenté sont visibles mais non payables, dont les deux QR sans invitation. Une commande exige un instantané de prix valide ; aucune addition de prix n'est présentée comme une décision commerciale.
- §1/5, PROD-01-002/003 : deux photographies réelles ajoutées pour le henné et l'entreprise sur l'accueil, avec les occasions mariage et anniversaire. Sources et licence dans `docs/design/ASSET-CREDITS.md`. Les textes reflètent les fonctions existantes et la préversion.

## Validation

Validation complète finale : `pnpm test:product` et `pnpm check:full` réussis, **211 tests** (12 produit, 2 architecture, 114 unitaires, 59 intégration, 24 E2E), build Next réussi, 41 traces serveur sans données locales ni secrets. Deux avertissements ESLint existants sur les images de QR restent présents.

Les tests couvrent intégrité binaire d'un ZIP réellement relu, lecture différée des sources, interruption, source tronquée/manquante, noms dangereux, export vide utile, sélection, isolation anonyme et entre deux comptes, RSVP réel et photo déposée via navigateur. Tests concernés : `tests/unit/media/Export.test.ts`, `tests/integration/product/Archive.test.ts`, `tests/e2e/exports.test.ts`, `tests/e2e/experience.test.ts`, `tests/unit/commerce/Catalog.test.ts`.

Comparaison visuelle avec `docs/myevents/png/31-photos-videos.png` : action de téléchargement rendue dans l'espace commun audio/photo conformément à la clarification ; palette ivoire/bordeaux, bordures et boutons réutilisés. Le layout ne prétend pas reproduire à l'identique la grille dense ni la colonne de modération de la maquette. Contrôles mobile 390 px, absence de débordement et Axe sur le bloc d'export. Captures du bloc dans `docs/audit/export-2026-09-30/` conservées après la validation finale. L'accueil est également couvert en 360/390/1440 px par les tests E2E existants.

## Limites restant à vérifier

Le parcours authentifié connecté avec Neon, les volumes de plusieurs Go et les connexions lentes restent à mesurer sur l'hébergement. Le flux évite la mise en mémoire des médias, mais reste soumis à la durée maximale d'une fonction Vercel ; aucun traitement de ZIP en arrière-plan ni reprise de transfert n'est déclaré livré. Voir les [limites de durée Vercel](https://vercel.com/docs/functions/configuring-functions/duration) et le [générateur ZIP utilisé](https://github.com/thejoshwolfe/yazl).

Ce lot n'ouvre pas la vente en production. Les autres écarts fonctionnels du cahier restent dans `COHERENCE-PRODUIT-2026-09-29.md` : Studio avancé, relances effectivement envoyées, équipe/rôles, stockage payant et conservation, back-office fournisseur et commandes, ainsi que validation commerciale et juridique du lancement.

## Déploiement vérifié

Le lot et les modifications antérieures du workspace sont déployés en Preview : `dpl_BA7rDsAZBRf6XBusWMGKoZcuoVpR`. [Préversion stable](https://myevents-staging-el-rhadis-projects.vercel.app). Build distant réussi ; vérification anonyme des accès et de l'accueil après affectation de l'alias. Les photographies ont été inspectées en 390/1440 px ; aucune image en erreur après décodage, aucun débordement ni erreur JavaScript (`preview-home-check.json`). Le scénario connecté authentifié reste distinct de ces preuves.
