# Cohérence produit — 29 septembre 2026

Périmètre : mise en œuvre des clarifications directes du propriétaire, consignées
par DEC-PROD-001 à 006 et `docs/product/CLARIFICATION-2026-09-29.md`. Ce rapport
sépare les parcours vérifiés des capacités produit encore partielles. Il ne
certifie pas que MyEvents est entièrement terminé ou prêt à commercialiser.

## Parcours développés

| Interface / règle       | Comportement livré                                                                                                                                                               | État du périmètre                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Studio, CLA-29-02       | Blocs calendrier, compte à rebours et dress code ; fonds généraux et de section, logo importé, opacité, cadres, ombres, typographie et ouverture paramétrables ; aperçu          | Partiel : le studio complet et les animations spécialisées restent ouverts                                |
| Lieux, CLA-29-02        | Un/deux lieux : adresse, horaire, itinéraire Google Maps ou Waze et image cartographique importable. Plus de deux : noms cliquables et horaires                                  | Vérification navigateur du changement de présentation ; génération automatique de carte non livrée        |
| Musique, CLA-29-02      | Fichier audio privé comptabilisé dans le stockage, publication par référence, lecteur à l’ouverture ; liens YouTube/Spotify validés et lecteurs chargés à la demande de l’invité | Import et accès contrôlé vérifiés ; aucune extraction de piste ni promesse de lecture automatique externe |
| Réponses, CLA-29-03     | Toutes les réponses, oui/non ; colonnes conservées pour les anciennes questions ; capture du libellé et champ explicitement relié au foyer                                       | Sous-parcours local vérifié ; foyer nominatif multi-membres à compléter                                   |
| Relance, CLA-29-03      | Décompte des destinataires attendus sans réponse ; préparation par lots de 100, liens personnels copiables et ouverture du composeur e-mail                                      | Préparation implémentée ; aucun envoi automatique ni preuve de réception                                  |
| Souvenirs, CLA-29-05/06 | Audio et photo/vidéo dans le même espace selon les achats ; rejet du partage invité audio dans domaine, providers et SQL ; anciens réglages audio normalisés                     | Règle de confidentialité vérifiée en local et PostgreSQL isolé                                            |
| Carte, CLA-29-07        | Création indépendante de l’invitation, images personnelles, reprise facultative du thème, QR sous droits, PDF recto/verso sans commande d’impression                             | Sous-parcours vérifié localement                                                                          |
| Matériaux, CLA-29-07    | Demande papier/carton/plexiglas ou matériau libre avec quantité, finition, notes et copie immuable de la carte enregistrée                                                       | Demande persistante vérifiée ; traitement fournisseur et devis à construire                               |
| Profil, CLA-29-08       | Modification des noms, accès au changement de mot de passe existant, usage du stockage du compte, lien vers achats                                                               | Noms et isolation vérifiés ; profil complet encore partiel                                                |
| Achats                  | Historique agrégé des commandes autorisées de tous les événements, statut et indication du mode test                                                                             | Implémenté ; factures et suivi physique complet ouverts                                                   |
| Stockage, DEC-PROD-001  | 3 Go par compte ; affichage de 1,49 € par Go supplémentaire                                                                                                                      | Achat non activé : périodicité demandée, sans réponse à ce jour                                           |

## Contrôles et preuves

- `tests/unit/invitations/Presentation.test.ts` : calendrier ICS, liens d’itinéraire,
  références de fichiers et origines des lecteurs musicaux autorisées.
- `tests/unit/guests/Responses.test.ts` : refus exclus des relances, foyer dérivé du
  champ publié, anciens libellés, absence de rattachement par simple e-mail.
- `tests/unit/media/Privacy.test.ts` : partage audio refusé, galerie photo/vidéo.
- `tests/unit/designs/Pdf.test.ts` : deux faces, dimensions en millimètres,
  incorporation des QR et refus d’images manquantes.
- `tests/integration/product/LocalProduct.test.ts` : audio seul sans invitation,
  anciens réglages neutralisés, carte indépendante et demande immuable/idempotente.
- `tests/integration/experience/NeonExperience.test.ts` : migrations 0011 à 0016,
  RLS inter-comptes, partage audio interdit jusque dans SQL, demandes immuables,
  profil sans modification des droits, protection des images et musiques publiées.
- `tests/e2e/product-clarifications.test.ts` : carte enregistrée puis PDF 200,
  refus anonyme et mauvaise révision, demande plexiglas persistante, contrôle axe,
  mobile sans débordement horizontal, profil, confidentialité audio ; studio,
  import WAV, publication, accès audio invité et réponse négative avec foyer.
- `tests/e2e/experience.test.ts` : non-régression du parcours existant invitation,
  fichiers privés, galerie, carnet CSV/Excel et liens individuels.

Les tests SQL utilisent PostgreSQL via PGlite. Cela ne constitue pas une migration
ou une validation sur un serveur Neon distant. Les migrations ne sont pas
appliquées à distance dans ce lot. Aucun paiement réel, envoi e-mail externe ou
déploiement n’a été effectué.

`corepack pnpm check:full` terminé avec succès : **202 tests réussis** — 12 produit,
2 architecture, 109 unitaires, 56 intégration et 23 navigateur. Formatage,
typage, contrat généré et compilation réussis. Les 40 traces serveur ne contiennent
ni données locales ni secrets ; les trois polices TTF sont incluses dans la trace
du serveur PDF. Deux avertissements ESLint historiques restent sur les balises
`img` des souvenirs.

Une compilation intermédiaire a rencontré ENOSPC. Seul le cache généré
`.next/cache/turbopack` a été supprimé ; la suite complète a ensuite réussi.
Aucune donnée applicative ni aucun fichier source n’a été supprimé.

## Comparaison visuelle

Références examinées : carrousel, écrans 19, 33 et 35 ; captures mobile de
l’invitation et des réponses. Preuves conservées dans
[coherence-2026-09-29](./coherence-2026-09-29/).

- Carte : palette ivoire/bordeaux, typographie Cormorant, recto/verso et propriétés
  latérales présents. La disposition actuelle garde la navigation générale ;
  elle ne reproduit pas encore l’éditeur plein écran, ses modèles, les guides de
  fond perdu ni son zoom. Sur mobile, les panneaux se suivent verticalement.
- PDF : les deux faces ont été rendues avec Poppler et inspectées. Un défaut des
  polices WOFF2 incorporées a été corrigé par leur décompression en TTF. Les
  fichiers `pdf-face-1.png` et `pdf-face-2.png` montrent les textes lisibles sans
  coupure. Le PDF conserve les dimensions A6 de l’exemple ; il ne promet pas une
  certification prépresse, PDF/X, CMJN ou fonds perdus. Les captures
  `pdf-images-polices-1.png` et `pdf-images-polices-2.png` vérifient aussi les trois
  polices, une photographie et un QR de test.
- Studio : contenu facultatif et rendu mobile cohérent ; moteur de blocs conservé.
  La reproduction complète du panneau de propriétés, de la timeline, des
  miniatures et des gestes de la maquette reste ouverte.
- Profil : formulaire lisible à 390 px ; les préférences, avatar, sessions,
  organisation, langues et sécurité avancée du carrousel ne sont pas encore
  implémentés par cet écran.

## Travail restant pour le produit complet

1. Terminer le studio détaillé du cahier : liberté de composition, bibliothèque,
   recadrage, animations réelles propres aux ouvertures, prévisualisations de
   cartes géographiques et conformité visuelle écran par écran.
2. Compléter foyers avec membres nominatifs, invitations groupées, relances avec
   canal d’envoi défini et suivi, rôles et espaces collaboratifs de gestion.
3. Finaliser les capacités avancées d’organisation : documents prestataires,
   exports et finitions budget/tâches/programme, sans inventer leur inclusion
   commerciale.
4. Livrer export ZIP, gestion de rétention, nettoyage des objets orphelins,
   notifications et gestion complète des quotas. Définir la périodicité avant
   l’achat de stockage, qui reste à construire.
5. Construire le traitement back-office des demandes d’impression : validation de
   faisabilité, devis, acceptation, paiement et suivi de fabrication/livraison.
6. Compléter administration, catalogue approuvé et vrais prix, factures,
   confidentialité/exercice des droits, informations légales de l’exploitant,
   pages commerciales et SEO. Le catalogue actuel est un catalogue de test.
7. Valider l’ensemble en environnement connecté puis effectuer le Revenue Gate
   avant toute mise en production commerciale.

Les descriptions de plusieurs anciennes exigences atomiques sont décalées par
rapport à leurs écrans (ex. écran 33 décrit historiquement une timeline, écran 35
une galerie). Elles ne sont pas renommées silencieusement. Les preuves de ce lot
se rattachent aux clarifications ci-dessus et aux nouvelles exigences atomiques
précises ; les anciennes déclarations de couverture restent à auditer.

## Références techniques consultées

- [PDFKit — polices et texte](https://pdfkit.org/docs/text.html).
- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)
  et [Waze Deep Links](https://developers.google.com/waze/deeplinks).
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)
  et [Spotify Embeds](https://developer.spotify.com/documentation/embeds).

Les lecteurs externes n’effectuent aucune requête avant que l’invité choisisse de
les charger. Leur lecture réelle reste dépendante du navigateur, de la plateforme
et de la disponibilité du contenu ; les tests locaux ne simulent pas un compte
Spotify ou YouTube authentifié.
