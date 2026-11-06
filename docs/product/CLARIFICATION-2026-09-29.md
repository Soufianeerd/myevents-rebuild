# Clarification produit du propriétaire — 29 septembre 2026

Source : explication directe du propriétaire dans la tâche « Reconnecter Stripe dans Codex », le 29 septembre 2026. Ces décisions complètent le cahier et remplacent ses règles incompatibles, conformément au registre de décisions. Il s’agit du comportement cible, pas d’une déclaration de conformité du logiciel actuel.

## CLA-29-01 — Entrée et public

La landing page présente les produits. Après connexion, l’utilisateur retrouve son espace de gestion. Le même produit accueille entreprise, couple, organisateur de henné, anniversaire et autres événements ; aucun parcours n’impose le mariage ou l’achat d’une invitation digitale.

## CLA-29-02 — Studio d’invitation

Le créateur compose son invitation et choisit les blocs à ajouter, retirer et personnaliser. La composition n’est pas une carte de mariage figée. Les blocs évoqués sont notamment : identité/logo facultatif, titre libre (anniversaire, noms des mariés, entreprise et label), citation facultative, lieux, calendrier facultatif, compte à rebours facultatif, RSVP composé par l’organisateur, dress code et autres blocs adaptés au besoin.

La personnalisation porte sur l’ouverture, la carte, les sections, les thèmes, tons, couleurs, typographies, animations, cadres, images de fond et opacité/transparence. Les contraintes de lisibilité, responsive et accessibilité du cahier restent applicables.

Rendu des lieux explicitement demandé :

- Un lieu : adresse, bouton d’itinéraire cliquable et aperçu cartographique visuel.
- Deux lieux : chaque lieu présente son nom, son heure, son accès à l’itinéraire et son aperçu cartographique.
- Plus de deux lieux : noms et horaires ; les noms sont cliquables pour accéder à l’itinéraire avec Google Maps ou Waze. Ne pas généraliser automatiquement les grandes cartes du cas un/deux lieux à toutes les étapes.

Musique facultative : import d’un fichier et souhait d’utiliser YouTube ou Spotify comme source. La musique accompagne l’ouverture/consultation de l’invitation lorsqu’elle est configurée. Le mécanisme autorisé (lecteur intégré, lien ou autre), la disponibilité de lecture et les contraintes des plateformes/navigateurs doivent être vérifiés avant implémentation. Cette demande ne prouve ni une capacité d’extraction de pistes ni une lecture automatique garantie.

L’invité reçoit un **lien d’invitation digitale** qui ouvre le rendu publié. Aucun QR ne remplace ce lien.

## CLA-29-03 — Réponses, foyers et relance

Une interface réceptionne et liste toutes les réponses RSVP, positives et négatives, avec tous les champs configurés par le créateur.

Si le formulaire comporte le foyer, l’information doit établir une correspondance exploitable avec le foyer dans la liste des invités. Résultat attendu : retrouver les membres de chaque foyer sans perdre le rattachement entre formulaire et gestion des contacts. Le détail de l’interface de saisie/sélection du foyer reste à concevoir.

La relance vise les invités attendus qui n’ont pas répondu. Elle affiche le nombre concerné et permet de lancer la relance de ce groupe. Une réponse négative est une réponse et ne doit pas être traitée comme une absence de réponse.

Conséquence fonctionnelle : le calcul des non-répondants exige une liste de destinataires attendus. Les personnes inconnues ayant reçu un lien général transféré ne peuvent pas être comptées comme non-répondants identifiés. Le canal d’envoi et le suivi exact restent à définir ; un lien copiable ne vaut pas preuve d’envoi automatique.

## CLA-29-04 — Budget

Une interface dédiée gère le budget de l’événement dans son ensemble : prestataires, achats, produits et dépenses, avec les détails de suivi du cahier §26–29. Ce module doit être pris en compte dans l’expérience décrite par le propriétaire. Son inclusion commerciale selon les achats et son éventuel changement de priorité P0/P1 n’ont pas été explicitement fixés par ce message.

## CLA-29-05 — Produits, packs et espace souvenirs

Produits indépendants : invitation digitale, QR livre audio, QR photo/vidéo et carte de remerciement. Le client peut acheter uniquement un QR, les deux QR sans invitation, ou uniquement une carte de remerciement.

Packs décrits par le propriétaire :

1. Invitation digitale seule.
2. Invitation digitale + QR livre audio.
3. Invitation digitale + QR livre audio + QR photo/vidéo.

Ces compositions n’introduisent aucun moteur de pack distinct. Elles ne fixent pas de prix. Toute composition commerciale supplémentaire doit être clairement distinguée de ces packs décrits.

Un **espace souvenirs commun** rassemble l’audio et la photo/vidéo. Les parties utilisables dépendent des produits acquis : audio seul, photo/vidéo seul ou les deux. L’absence d’invitation digitale ne bloque pas ces produits. Le traitement UI exact des modules non acquis (masqués ou proposés à l’achat) n’est pas arrêté ici.

Après scan du QR dédié et contribution de l’invité, le média est reçu dans la partie correspondante de l’espace de l’organisateur.

## CLA-29-06 — Partage des souvenirs

Le choix **privé ou collaboratif avec les invités concerne uniquement les photos et vidéos**. Le livre audio ne devient pas une galerie collaborative pour les invités.

La contribution audio reste possible pour les personnes ayant accès au QR audio ; ce droit de dépôt ne leur donne pas accès aux messages des autres invités. Cette règle ne retire pas aux collaborateurs de gestion leurs droits explicitement accordés selon leur rôle.

Le mode photo/vidéo privé réserve la consultation à l’organisateur et aux accès de gestion autorisés ; le mode collaboratif permet le partage avec les invités selon les réglages. Le délai de publication du cahier n’est pas modifié par ce message.

## CLA-29-07 — Carte de remerciement indépendante

L’interface de carte de remerciement possède sa personnalisation (textes, typographies, thème et éléments visuels). Elle peut reprendre la cohérence visuelle de l’invitation lorsque celle-ci existe. Avoir acheté/créé l’invitation sur MyEvents n’est pas une condition : une personne ayant fait ses invitations ailleurs peut créer sa carte ici.

Les QR audio/photo-vidéo peuvent être ajoutés si le client a acquis les produits correspondants.

Deux sorties sont prévues :

- Générer et télécharger un **PDF** pour faire imprimer soi-même ailleurs. L’achat d’une impression MyEvents n’est pas obligatoire. Le prix éventuel de la création/export n’est pas déterminé dans ce message.
- Demander une impression via MyEvents et son fournisseur. Le client peut demander papier simple, papier cartonné, plexiglas ou un autre matériau. La réalisation dépend de la faisabilité validée ; toutes les matières demandées ne sont pas réputées disponibles automatiquement. Le parcours doit intégrer demande, validation de faisabilité et commande/livraison, sans inventer de tarif ni de délai.

## CLA-29-08 — Compte et stockage

Chaque compte reçoit **3 Go dès sa création**. Le quota est au niveau du compte et n’est pas multiplié par événement.

Nouvelle tarification explicite : **1,49 € par Go supplémentaire**. Elle remplace la règle historique « +3 Go à 1,99 € ». Le message ne précise pas achat ponctuel ou abonnement, durée, prorata ni traitement d’une diminution du quota : ne pas les inventer.

L’espace comprend aussi la gestion du profil et du stockage conformément au cahier.

## Écarts constatés au début de l’alignement

- Le schéma et les contrôles de médias actuels autorisent une configuration collaborative pour les deux types d’espace. Ils doivent être alignés sur CLA-29-06 dans le domaine, les actions serveur, les providers, les fonctions SQL et l’UI ; masquer un bouton seul ne suffit pas.
- Les preuves du 27 septembre valident leur périmètre technique historique ; elles ne valident pas cette nouvelle restriction audio.
- L’export PDF autonome, la demande de matériau avec faisabilité et les sources musicales externes ne sont pas déclarés implémentés par cette clarification.
- Le catalogue `testOffers` reste un jeu d’essai, pas une liste de prix commerciaux approuvés.

L’implémentation réalisée ensuite, les tests et les limites restantes sont suivis dans
[COHERENCE-PRODUIT-2026-09-29](../audit/COHERENCE-PRODUIT-2026-09-29.md).

## Vérification attendue lors de l’implémentation

Vérifier notamment : QR seuls sans invitation ; regroupement des médias selon les achats ; refus serveur de partage collaboratif audio ; photo/vidéo privé ou partagé ; correspondance foyer/RSVP ; relance excluant les réponses négatives ; carte autonome avec PDF sans commande d’impression ; QR de carte soumis aux droits ; stockage initial de 3 Go et prix de 149 centimes par Go ajouté une fois la périodicité définie.
