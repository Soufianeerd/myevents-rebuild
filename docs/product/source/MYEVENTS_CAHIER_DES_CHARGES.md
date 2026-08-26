# MyEvents — Cahier des charges fonctionnel et produit

## 1. Vision générale

MyEvents est une plateforme complète de création, de gestion et de prolongation d’événements.

L’objectif n’est pas de créer uniquement un générateur d’invitations de mariage. La plateforme doit pouvoir être utilisée pour différents types d’événements :

- mariages ;
- fiançailles ;
- anniversaires ;
- baptêmes ;
- baby showers ;
- événements familiaux ;
- événements d’entreprise ;
- séminaires ;
- conférences ;
- lancements de produits ;
- galas ;
- événements associatifs ;
- événements culturels ;
- soirées privées ;
- événements organisés par des professionnels ;
- tout autre événement nécessitant invitations, gestion des participants et collecte de souvenirs.

La philosophie du produit repose sur quatre piliers :

1. **Créer** l’identité et l’invitation de l’événement.
2. **Organiser** l’événement et les invités.
3. **Faire vivre** l’événement grâce aux espaces audio, photo et vidéo.
4. **Prolonger** l’événement avec les souvenirs, les espaces collaboratifs et les supports physiques de remerciement.

MyEvents doit ainsi fonctionner comme une combinaison entre :

- un éditeur visuel proche de Canva dans sa simplicité ;
- une plateforme d’invitations digitales ;
- un gestionnaire d’invités et de RSVP ;
- un espace d’organisation événementielle ;
- un espace collaboratif pour les souvenirs ;
- une boutique de produits digitaux et physiques liés à l’événement.

---

# 2. Principe fondamental concernant les invitations et les QR codes

Une distinction claire doit être faite entre les **invitations digitales** et les **QR codes**.

## 2.1 Invitation digitale

Une invitation digitale est publiée sous la forme d'un **lien web partageable**.

Elle peut notamment être envoyée :

- par WhatsApp ;
- par SMS ;
- par e-mail ;
- par Messenger ;
- via les réseaux sociaux ;
- copiée manuellement ;
- intégrée dans une communication externe.

L’invitation digitale **n’est pas un QR code**.

Le lien ouvre directement l’expérience interactive conçue dans le Studio MyEvents.

Exemple de logique :

`https://myevents.fr/i/identifiant-evenement`

L’URL exacte devra être courte, lisible et sécurisée.

---

## 2.2 QR codes

Les QR codes sont réservés aux services complémentaires liés à l’événement.

Principalement :

### QR Audio

Redirection vers l’espace permettant aux invités :

- d’enregistrer un message vocal ;
- d’envoyer un fichier audio existant ;
- d’écouter éventuellement les contenus autorisés après l’événement.

### QR Photo / Vidéo

Redirection vers l’espace permettant :

- d’envoyer des photos ;
- d’envoyer des vidéos ;
- de capturer directement une photo ;
- de capturer directement une vidéo ;
- d’accéder ultérieurement à la galerie si le mode collaboratif est activé.

Lorsqu’un client souscrit aux deux services, deux QR codes distincts sont générés par défaut :

- QR Audio ;
- QR Photo / Vidéo.

Un QR code ne doit jamais être utilisé par défaut comme substitut du lien d’invitation.

---

# 3. Catalogue commercial

Chaque service doit pouvoir être acheté :

- individuellement ;
- dans un pack ;
- en complément d’un autre produit ;
- avant l’événement ;
- éventuellement après la création initiale de l’événement.

La logique commerciale doit donc être entièrement modulaire.

## 3.1 Produits principaux

### Produit A — Invitation digitale

Comprend :

- création de l’invitation ;
- accès au Studio ;
- personnalisation ;
- publication ;
- lien partageable ;
- RSVP si inclus dans la formule choisie ;
- gestion des invités associée.

### Produit B — QR Audio

Comprend :

- génération du QR code audio ;
- espace d’enregistrement ;
- stockage des messages ;
- gestion des audios ;
- téléchargement des fichiers ;
- contrôle de confidentialité.

### Produit C — QR Photo / Vidéo

Comprend :

- QR code dédié ;
- espace de dépôt ;
- galerie privée ;
- stockage photo ;
- stockage vidéo ;
- téléchargement ;
- gestion de la confidentialité.

### Produit D — Cartes de remerciement

Comprend :

- éditeur visuel ;
- modèles ;
- personnalisation ;
- possibilité d’intégrer les QR codes achetés ;
- préparation pour impression ;
- choix des matériaux ;
- choix du format ;
- choix des quantités ;
- commande ;
- impression ;
- livraison.

### Produit E — Produits imprimés événementiels

L’architecture doit être suffisamment générique pour permettre ultérieurement de proposer :

- chevalets ;
- menus ;
- cartes de table ;
- marque-places ;
- panneaux ;
- plans de table ;
- cartes souvenirs ;
- livrets ;
- cartes RSVP ;
- signalétique ;
- supports plexiglas ;
- autres objets personnalisés.

---

# 4. Packs

Les packs ne doivent être qu’un regroupement commercial de produits existants.

Il ne faut pas développer une logique séparée pour chaque pack.

Exemples :

### Pack Invitation

- invitation digitale.

### Pack Invitation + Audio

- invitation digitale ;
- QR Audio.

### Pack Invitation + Souvenirs

- invitation digitale ;
- QR Photo / Vidéo.

### Pack Expérience complète

- invitation digitale ;
- QR Audio ;
- QR Photo / Vidéo.

D’autres éléments pourront ensuite être proposés :

- cartes de remerciement ;
- stockage supplémentaire ;
- options collaboratives ;
- produits imprimés ;
- options professionnelles.

Le back-office doit permettre de créer, modifier, masquer ou supprimer des packs sans modifier le code.

---

# 5. Landing page MyEvents

La landing page constitue l’entrée commerciale de la plateforme.

Elle doit immédiatement expliquer :

- ce qu’est MyEvents ;
- ce que la plateforme permet de créer ;
- à qui elle s’adresse ;
- les produits disponibles ;
- les différences entre les produits ;
- les packs ;
- le fonctionnement du Studio ;
- le fonctionnement des QR codes ;
- les possibilités de personnalisation.

## Sections recommandées

### Hero

Présentation simple du concept avec CTA principaux :

- Créer mon événement
- Découvrir les modèles
- Voir une démonstration

### Produits

Présentation séparée de chaque produit.

### Packs

Comparaison claire des différentes offres.

### Démonstrations

Possibilité d’ouvrir de véritables invitations de démonstration.

### Galerie d’inspiration

Présentation de modèles :

- mariage ;
- entreprise ;
- anniversaire ;
- association ;
- événement premium ;
- minimaliste ;
- floral ;
- moderne ;
- oriental ;
- classique ;
- etc.

### Fonctionnement

Parcours simplifié :

**Créer → Personnaliser → Publier → Inviter → Organiser → Collecter → Revivre.**

### Studio

Présentation de l’éditeur.

### QR Audio

Démonstration du fonctionnement.

### QR Photo / Vidéo

Démonstration du fonctionnement.

### Gestion des invités

Présentation RSVP et dashboard.

### Organisation

Budget, tâches, planning, fournisseurs, etc.

### Supports physiques

Cartes et produits personnalisés.

### FAQ

### Avis et réalisations

### Footer complet

---

# 6. Création d’un événement

Après inscription, l’utilisateur peut créer un événement.

Un même compte doit pouvoir gérer plusieurs événements.

Lors de la création :

### Étape 1 — Type d’événement

Sélection d’un type :

- mariage ;
- anniversaire ;
- entreprise ;
- association ;
- etc.

Le type sert uniquement à proposer :

- des modèles adaptés ;
- des textes adaptés ;
- des sections adaptées ;
- des champs RSVP adaptés.

Il ne doit pas enfermer le client dans un fonctionnement particulier.

### Étape 2 — Informations générales

Exemples :

- nom de l’événement ;
- organisateur ;
- date ;
- heure ;
- fuseau horaire ;
- lieu principal ;
- langue ;
- nombre estimé d’invités.

### Étape 3 — Services

Sélection des produits :

- invitation ;
- audio ;
- photo / vidéo ;
- cartes ;
- options supplémentaires.

### Étape 4 — Création

Choix entre :

- partir de zéro ;
- utiliser un modèle ;
- reprendre une ancienne création ;
- dupliquer un événement ;
- utiliser une combinaison proposée.

---

# 7. Studio MyEvents

Le Studio constitue le cœur du produit.

Il doit être extrêmement simple pour un utilisateur non technique tout en permettant une personnalisation avancée.

Le Studio fonctionne avec des **sections / blocs configurables**.

---

# 8. Architecture générale du Studio

L’interface peut être organisée en quatre zones principales.

## Barre supérieure

Actions globales :

- nom de l’événement ;
- sauvegarde ;
- état de sauvegarde ;
- annuler ;
- rétablir ;
- aperçu ;
- vue mobile ;
- vue tablette ;
- vue ordinateur ;
- partager un aperçu ;
- publier ;
- paramètres.

## Barre latérale gauche

Bibliothèque :

- sections ;
- composants ;
- médias ;
- textes ;
- icônes ;
- formes ;
- symboles ;
- modèles ;
- arrière-plans ;
- animations.

## Canvas central

Visualisation directe de l’invitation.

## Panneau latéral droit

Propriétés de l’élément sélectionné.

Exemples :

- couleurs ;
- typographie ;
- dimensions ;
- alignement ;
- espacement ;
- transparence ;
- bordure ;
- ombre ;
- animation ;
- arrière-plan ;
- comportement responsive.

---

# 9. Drag-and-drop

Le système doit permettre de déplacer les sections par drag-and-drop.

Cependant, le Studio ne doit pas être un canvas totalement libre risquant de produire une invitation inutilisable sur téléphone.

Il faut distinguer :

### Niveau 1 — Sections

Déplacement vertical libre des grandes sections.

### Niveau 2 — Mise en page

Choix parmi plusieurs layouts compatibles avec la section.

### Niveau 3 — Éléments

Déplacement de certains éléments dans des zones contrôlées.

### Niveau avancé

Possibilité de repositionner plus librement certains éléments tout en conservant :

- marges de sécurité ;
- responsive ;
- zones visibles ;
- limites de débordement.

---

# 10. Personnalisation commune à toutes les sections

Chaque bloc doit pouvoir être personnalisé indépendamment.

## Contenu

- textes ;
- images ;
- icônes ;
- logos ;
- symboles ;
- liens.

## Arrière-plan

- couleur ;
- dégradé ;
- image ;
- texture ;
- vidéo courte si autorisée ;
- transparence.

## Conteneur

- largeur ;
- hauteur minimale ;
- alignement ;
- espacement ;
- marges ;
- padding ;
- bordure ;
- arrondi ;
- ombre ;
- flou ;
- opacité.

## Typographie

- police ;
- taille ;
- graisse ;
- italique ;
- casse ;
- espacement des lettres ;
- hauteur des lignes ;
- alignement.

## Animation

- apparition ;
- fondu ;
- zoom ;
- translation ;
- parallaxe ;
- révélation ;
- animation personnalisée selon le composant.

Chaque section peut recevoir une animation différente.

---

# 11. Fond global de l’invitation

L’utilisateur peut définir un arrière-plan commun à toute l’invitation :

- photographie ;
- illustration ;
- texture ;
- couleur ;
- gradient ;
- animation légère.

Exemple :

une photographie peut être utilisée comme fond général tandis que les différentes sections sont configurées avec une opacité de 60 à 80 % afin de conserver l’image visible en arrière-plan.

La lisibilité doit toutefois toujours être contrôlée.

Le Studio peut afficher une alerte lorsque le contraste texte/fond devient insuffisant.

---

# 12. Animation d’ouverture

L’invitation peut commencer par une expérience d’ouverture.

Plusieurs catégories doivent être disponibles :

- enveloppe ;
- rideaux ;
- portes ;
- carte pliée ;
- coffret ;
- parchemin ;
- écran cinématique ;
- ouverture minimaliste.

Exemple pour l’enveloppe :

1. affichage de l’enveloppe ;
2. présence d’un sceau ;
3. clic ou pression sur le sceau ;
4. rupture/ouverture du sceau ;
5. ouverture de l’enveloppe ;
6. apparition de la carte ;
7. transition vers l’invitation.

Le Studio doit permettre de personnaliser :

- enveloppe ;
- papier ;
- couleur ;
- sceau ;
- initiales ;
- symbole ;
- vitesse ;
- transition ;
- arrière-plan ;
- sons éventuels.

Une option **« Passer l’introduction »** doit exister.

Un mode compatible avec les préférences système de réduction des animations doit également être prévu.

---

# 13. Musique

Une musique peut être associée à l’invitation.

Possibilités :

- importer un fichier ;
- sélectionner une musique proposée par MyEvents ;
- désactiver la musique.

Paramètres :

- volume ;
- lecture ;
- boucle ;
- bouton mute ;
- déclenchement après ouverture de l’invitation.

Les navigateurs bloquant souvent la lecture automatique, la musique peut être déclenchée à la première interaction, notamment lors du clic sur le sceau.

Les musiques proposées directement par MyEvents doivent disposer des droits nécessaires.

---

# 14. Bloc identité

Premier élément symbolique de l’invitation.

Il peut comporter :

- initiales ;
- monogramme ;
- logo ;
- symbole ;
- icône ;
- image ;
- phrase ;
- mot ;
- emblème.

Exemples :

- logo d’entreprise ;
- initiales des mariés ;
- symbole d’association ;
- pictogramme d’événement.

---

# 15. Bloc titre

Permet d'afficher l’identité principale de l’événement.

Exemples :

- noms des mariés ;
- nom de l’entreprise ;
- nom de l’événement ;
- nom de la conférence ;
- anniversaire de X ;
- gala annuel.

Possibilité de choisir :

- titre ;
- sous-titre ;
- ordre ;
- taille ;
- disposition.

---

# 16. Bloc phrase / message

Permet d’ajouter :

- phrase d’accroche ;
- vœu ;
- devise ;
- citation ;
- message personnel ;
- mot doux ;
- introduction ;
- texte institutionnel.

Une bibliothèque de textes peut être proposée.

Les contenus pourront être classés par :

- événement ;
- style ;
- ton ;
- longueur ;
- langue.

Le client peut :

- utiliser une proposition ;
- la modifier ;
- écrire son propre texte.

---

# 17. Parcours des lieux

Cette section représente graphiquement les différents lieux de l’événement.

Chaque lieu doit être cliquable.

Un clic permet d’ouvrir :

- l’adresse ;
- une application de navigation ;
- les informations pratiques.

Chaque étape peut contenir :

- nom ;
- adresse ;
- heure ;
- description ;
- icône ;
- photo ;
- coordonnées ;
- bouton itinéraire.

## 1 lieu

Affichage d’une carte principale avec localisation.

## 2 lieux

Affichage d’une carte permettant de visualiser le parcours entre les deux étapes.

## 3 lieux ou plus

Activation d’un mode **parcours**.

Les lieux apparaissent dans l’ordre chronologique et sont reliés par une ligne visuelle :

- courbe ;
- ondulée ;
- pointillée ;
- type itinéraire ;
- type carte au trésor.

Exemple :

Cérémonie  
↓  
Photos  
↓  
Cocktail  
↓  
Réception  
↓  
After-party

Le style du tracé doit être personnalisable.

---

# 18. Bloc programme

Module distinct permettant de présenter le déroulement de la journée.

Chaque étape :

- heure ;
- titre ;
- description ;
- icône ;
- lieu associé.

Exemple :

15:00 — Cérémonie  
16:30 — Photos  
18:00 — Cocktail  
20:00 — Dîner  
23:00 — Soirée

---

# 19. Calendrier et compte à rebours

Bloc permettant d’afficher :

- date ;
- heure ;
- jour ;
- compte à rebours.

Formats possibles :

- jours ;
- jours/heures ;
- jours/heures/minutes ;
- jours/heures/minutes/secondes.

Actions :

- Ajouter à Google Calendar
- Ajouter au calendrier Apple
- Télécharger un fichier calendrier

Après la date de l’événement, le compte à rebours peut automatiquement devenir :

- « L’événement a commencé » ;
- « Merci d’avoir participé » ;
- ou un texte personnalisé.

---

# 20. RSVP

Le formulaire RSVP doit être entièrement personnalisable.

Le créateur choisit exactement les informations qu’il souhaite demander.

## Champs disponibles

Exemples :

- nom ;
- prénom ;
- e-mail ;
- téléphone ;
- présence ;
- nombre d’accompagnants ;
- noms des accompagnants ;
- groupe ;
- menu ;
- régime alimentaire ;
- allergies ;
- hébergement ;
- transport ;
- besoin de navette ;
- commentaire ;
- message ;
- réponse libre.

Le créateur peut également créer ses propres champs.

Types :

- texte ;
- nombre ;
- e-mail ;
- téléphone ;
- choix unique ;
- choix multiple ;
- oui/non ;
- liste ;
- date ;
- texte long.

Pour chaque champ :

- obligatoire / facultatif ;
- label ;
- description ;
- options ;
- ordre.

---

# 21. Gestion dynamique des données RSVP

Chaque champ ajouté au formulaire doit automatiquement devenir une donnée exploitable dans la gestion des invités.

Exemple :

| Formulaire    | Tableau invités       |
| ------------- | --------------------- |
| Nom           | colonne Nom           |
| Prénom        | colonne Prénom        |
| Groupe        | colonne Groupe        |
| Accompagnants | colonne Accompagnants |
| Menu          | colonne Menu          |
| Navette       | colonne Navette       |

Il n’existe donc pas un tableau RSVP figé.

Le tableau s’adapte automatiquement à la configuration du formulaire.

---

# 22. Gestion des invités

Le dashboard invités doit permettre :

- création manuelle ;
- import CSV/Excel ;
- suppression ;
- modification ;
- regroupement ;
- recherche ;
- filtres ;
- tri ;
- export.

Statuts possibles :

- pas encore invité ;
- invitation envoyée ;
- invitation ouverte ;
- réponse en attente ;
- présent ;
- absent ;
- réponse incomplète.

Groupes possibles :

- famille ;
- amis ;
- collègues ;
- VIP ;
- partenaires ;
- table ;
- équipe ;
- groupe personnalisé.

Actions en masse :

- envoyer une invitation ;
- envoyer un rappel ;
- changer le groupe ;
- exporter ;
- supprimer.

---

# 23. Invitation individualisée

Une évolution importante doit permettre de générer une invitation liée à un invité ou un foyer.

Exemple :

`Invitation famille Martin`

Le formulaire peut alors déjà connaître certains éléments :

- nom ;
- nombre maximal d’accompagnants ;
- groupe ;
- invitation concernée.

Cela permet de réduire :

- les doublons ;
- les réponses inconnues ;
- les erreurs de saisie.

---

# 24. Dashboard événement

Chaque événement dispose de son propre espace.

Navigation possible :

- Vue d’ensemble
- Invitation
- Invités
- RSVP
- Organisation
- Budget
- Planning
- Audio
- Photos / Vidéos
- Cartes
- Produits
- Collaborateurs
- Statistiques
- Paramètres

---

# 25. Tableau de bord principal

La page d’accueil de l’événement affiche notamment :

- date de l’événement ;
- compte à rebours ;
- nombre d’invités ;
- réponses ;
- présents ;
- absents ;
- réponses manquantes ;
- budget ;
- tâches ;
- stockage utilisé ;
- photos reçues ;
- vidéos reçues ;
- messages audio reçus ;
- activité récente.

---

# 26. Gestion de l’organisation

MyEvents doit également devenir un outil d’organisation.

## Tâches

Une tâche contient :

- titre ;
- description ;
- responsable ;
- catégorie ;
- date ;
- priorité ;
- statut ;
- notes ;
- pièces jointes.

Statuts :

- à faire ;
- en cours ;
- bloqué ;
- terminé.

---

# 27. Roadmap événementielle

Affichage possible :

- liste ;
- calendrier ;
- timeline ;
- kanban.

Exemple :

J-365  
Réserver le lieu

J-240  
Choisir le prestataire

J-120  
Finaliser les invités

J-60  
Envoyer les invitations

J-30  
Relancer les RSVP

J-7  
Clôturer les réponses

---

# 28. Budget

Gestion complète du budget.

Chaque ligne contient :

- catégorie ;
- prestataire ;
- budget prévu ;
- coût réel ;
- acompte ;
- montant payé ;
- reste à payer ;
- date d’échéance ;
- statut ;
- justificatif.

Dashboard :

- budget total ;
- engagé ;
- payé ;
- restant ;
- dépassement ;
- répartition par catégorie.

---

# 29. Prestataires

Module facultatif mais recommandé.

Informations :

- entreprise ;
- type ;
- contact ;
- téléphone ;
- e-mail ;
- prix ;
- acompte ;
- échéance ;
- contrat ;
- facture ;
- notes.

---

# 30. Espace Audio

Le QR Audio renvoie vers une interface extrêmement simple.

L’utilisateur qui scanne le QR doit pouvoir immédiatement :

1. comprendre ce qu’il doit faire ;
2. autoriser son microphone ;
3. enregistrer ;
4. écouter ;
5. recommencer ;
6. envoyer.

Possibilité également d’importer un audio.

Le créateur retrouve ensuite :

- durée ;
- date ;
- auteur si renseigné ;
- fichier ;
- état ;
- téléchargement.

Actions :

- écouter ;
- renommer ;
- supprimer ;
- télécharger ;
- sélectionner ;
- télécharger plusieurs fichiers.

---

# 31. Espace Photo / Vidéo

Après scan du QR :

- prendre une photo ;
- importer une photo ;
- enregistrer une vidéo ;
- importer une vidéo.

L’expérience doit être pensée en priorité pour le smartphone.

Formats acceptés, tailles maximales et compression doivent être configurables.

Les médias peuvent être automatiquement optimisés pour réduire le stockage sans dégrader sensiblement la qualité.

---

# 32. Galerie privée

Le propriétaire dispose d’une galerie centralisée.

Fonctions :

- mosaïque ;
- plein écran ;
- filtre photo/vidéo ;
- date ;
- auteur ;
- favoris ;
- sélection multiple ;
- suppression ;
- téléchargement.

---

# 33. Mode collaboratif

Chaque espace média possède une option :

**Espace collaboratif : activé / désactivé**

## Désactivé

Les invités peuvent déposer les contenus autorisés.

Seul le propriétaire et les collaborateurs autorisés peuvent ensuite consulter l’ensemble de la galerie.

## Activé

Les invités déposent leurs contenus pendant l’événement.

Après un délai configurable — **24 heures par défaut après la fin de l’événement** — la galerie collaborative peut devenir accessible aux personnes autorisées.

Un e-mail est alors envoyé aux invités ayant fourni une adresse e-mail.

L’e-mail contient un bouton :

**Découvrir les souvenirs de l’événement**

Pour les invités sans adresse e-mail, un lien partageable peut être fourni au créateur.

---

# 34. Confidentialité des médias

Le créateur doit pouvoir définir :

- qui peut déposer ;
- qui peut consulter ;
- qui peut télécharger.

Exemples :

### Privé

Créateur uniquement.

### Collaborateurs

Créateur + personnes invitées dans le dashboard.

### Invités

Tous les invités disposant du lien.

### Lien sécurisé

Toute personne possédant le lien.

Un code d’accès optionnel peut être ajouté.

---

# 35. Modération

Le propriétaire doit pouvoir :

- supprimer un contenu ;
- masquer un contenu ;
- bloquer un téléchargement ;
- désactiver temporairement un espace ;
- supprimer plusieurs éléments.

Pour les espaces publics ou collaboratifs, une fonction de signalement peut également être prévue.

---

# 36. Cartes de remerciement

Le client peut créer ses cartes directement depuis MyEvents.

Le fonctionnement doit être proche d’un mini-Canva spécialisé.

Il peut :

- choisir un modèle ;
- modifier les textes ;
- ajouter des images ;
- ajouter un logo ;
- ajouter des formes ;
- changer les couleurs ;
- modifier les typographies ;
- ajouter un QR Audio ;
- ajouter un QR Photo / Vidéo.

Les QR codes ne sont disponibles dans l’éditeur que lorsque le produit correspondant a été activé.

---

# 37. Impression

Après création :

1. choix du format ;
2. choix du matériau ;
3. choix de la finition ;
4. choix de la quantité ;
5. aperçu ;
6. contrôle ;
7. adresse ;
8. paiement ;
9. validation ;
10. impression ;
11. expédition.

---

# 38. Matériaux

Le catalogue doit être administrable.

Exemples :

- papier standard ;
- papier premium ;
- papier texturé ;
- papier cartonné ;
- parchemin ;
- transparent ;
- plexiglas ;
- autres supports.

Chaque matériau possède :

- prix ;
- formats disponibles ;
- quantités ;
- minimum de commande ;
- délai ;
- caractéristiques ;
- image ;
- actif/inactif.

---

# 39. Tarification de l’impression

Le prix dépend notamment :

- du produit ;
- du matériau ;
- du format ;
- de la quantité ;
- de la finition ;
- des options ;
- de la livraison.

Les tarifs doivent être modifiables depuis le back-office sans mise à jour du code.

---

# 40. Moteur générique de produits personnalisables

Le système de cartes doit être construit de manière suffisamment générique pour permettre ensuite de proposer d’autres objets.

Par exemple :

- chevalet ;
- menu ;
- numéro de table ;
- marque-place ;
- panneau ;
- welcome sign ;
- carte souvenir.

Chaque produit reprend le même principe :

**Produit → dimensions → matériau → design → quantité → impression → livraison.**

---

# 41. Bibliothèque de modèles

MyEvents doit proposer une importante source d’inspiration.

Les modèles peuvent être filtrés par :

- type d’événement ;
- style ;
- couleur ;
- saison ;
- niveau de sobriété ;
- ambiance ;
- animation ;
- format.

---

# 42. Combinaisons quasi infinies

Il ne faut pas uniquement enregistrer des pages complètes.

Le moteur doit décomposer un design en éléments réutilisables :

- palette ;
- typographies ;
- arrière-plan ;
- introduction ;
- style de titre ;
- séparation ;
- style des lieux ;
- style RSVP ;
- animations ;
- footer.

Cela permet de produire un très grand nombre de combinaisons sans devoir créer manuellement des milliers de modèles complets.

---

# 43. Créations réalisées par les clients

Les créations clients doivent être enregistrées dans leur compte.

Elles peuvent être :

- réutilisées ;
- dupliquées ;
- modifiées ;
- archivées.

En revanche, elles ne doivent **jamais être publiées automatiquement dans la galerie publique d’inspiration**.

Le client peut volontairement accepter :

**« Autoriser MyEvents à utiliser ce design comme source d’inspiration. »**

Avant publication :

- suppression des données personnelles ;
- remplacement des noms ;
- suppression des photos privées ;
- retrait des coordonnées ;
- validation par MyEvents.

Cette méthode permet d’enrichir progressivement la bibliothèque sans exposer les informations personnelles des clients.

---

# 44. Historique du Studio

Le Studio doit intégrer :

- sauvegarde automatique ;
- annuler ;
- rétablir ;
- historique des versions ;
- duplication ;
- restauration.

Exemple :

- version actuelle ;
- il y a 10 minutes ;
- hier ;
- version publiée.

Cela évite qu’un utilisateur détruise accidentellement son invitation.

---

# 45. Brouillon, aperçu et publication

Une invitation possède plusieurs états :

- brouillon ;
- publiée ;
- suspendue ;
- événement terminé ;
- archivée.

L’utilisateur doit pouvoir modifier son invitation sans modifier immédiatement la version publique.

Workflow recommandé :

**Modifier → Prévisualiser → Publier les modifications.**

---

# 46. Responsive

Les invitations seront principalement ouvertes depuis un smartphone.

La priorité doit donc être :

**mobile-first.**

Chaque modification doit être contrôlée sur :

- mobile ;
- tablette ;
- desktop.

Certaines propriétés peuvent être différentes selon l’écran.

---

# 47. Performance

Une invitation doit rester rapide même avec :

- photos ;
- animations ;
- musique ;
- cartes ;
- plusieurs sections.

Il faut notamment prévoir :

- compression des images ;
- lazy loading ;
- formats modernes ;
- chargement progressif ;
- préchargement intelligent ;
- optimisation vidéo ;
- animations GPU lorsque possible.

---

# 48. Accessibilité

Prévoir :

- contraste suffisant ;
- navigation clavier ;
- textes alternatifs ;
- tailles minimales ;
- réduction des animations ;
- boutons suffisamment grands ;
- compatibilité lecteur d’écran.

---

# 49. Multilingue

Une invitation peut disposer de plusieurs langues.

Exemple :

FR | EN

Le client peut traduire indépendamment :

- titres ;
- textes ;
- lieux ;
- programme ;
- RSVP ;
- messages système.

L’architecture graphique doit également être compatible avec les langues s’écrivant de droite à gauche.

---

# 50. Statistiques

Chaque événement doit proposer des statistiques utiles.

## Invitation

- vues ;
- visiteurs uniques ;
- première ouverture ;
- dernière ouverture ;
- taux de RSVP.

## RSVP

- réponses ;
- présents ;
- absents ;
- réponses manquantes ;
- accompagnants.

## QR Audio

- scans ;
- enregistrements ;
- taux de conversion.

## QR Photo / Vidéo

- scans ;
- médias envoyés ;
- nombre de contributeurs.

L’objectif n’est pas de surveiller inutilement les invités, mais d’aider l’organisateur à comprendre l’utilisation de son événement.

---

# 51. Espace profil

Le compte utilisateur doit regrouper :

## Profil

- identité ;
- coordonnées ;
- photo ;
- langue.

## Compte

- e-mail ;
- mot de passe ;
- sécurité ;
- sessions ;
- suppression du compte.

## Événements

- actifs ;
- terminés ;
- archivés.

## Abonnement / produits

- produits achetés ;
- options ;
- factures ;
- paiements.

## Données

- export ;
- téléchargement ;
- suppression ;
- confidentialité.

## Stockage

- utilisé ;
- disponible ;
- répartition ;
- extensions.

---

# 52. Stockage

Chaque compte bénéficie par défaut de :

**3 Go de stockage.**

Le stockage englobe principalement :

- photos ;
- vidéos ;
- audios ;
- médias importés.

Lorsque la limite approche :

- alerte à 75 % ;
- alerte à 90 % ;
- blocage ou avertissement à 100 %.

L’utilisateur peut acheter du stockage supplémentaire par tranche de :

**+3 Go : 1,99 €**

La périodicité commerciale doit rester configurable dans le système afin de pouvoir choisir entre :

- achat ponctuel ;
- abonnement mensuel ;
- autre formule.

Une facturation mensuelle est généralement plus cohérente tant que les fichiers restent hébergés.

---

# 53. Gestion intelligente du stockage

L’utilisateur doit pouvoir savoir précisément ce qui occupe son espace.

Exemple :

- Photos : 1,2 Go
- Vidéos : 1,4 Go
- Audios : 250 Mo
- Studio : 80 Mo

Actions :

- supprimer ;
- sélectionner ;
- télécharger ;
- archiver ;
- libérer de l’espace.

---

# 54. Export complet

Depuis son compte, le client peut demander :

**Télécharger mes souvenirs**

Le système prépare une archive ZIP contenant par exemple :

```text
Mon-evenement/
├── photos/
├── videos/
├── audios/
├── invitation/
├── rsvp/
└── exports/
```

Les données structurées peuvent également être exportées :

- CSV ;
- JSON ;
- PDF lorsque pertinent.

---

# 55. Suppression après téléchargement

Après export, l’utilisateur peut choisir :

**Télécharger puis supprimer du cloud**

Le système doit demander une confirmation claire avant suppression définitive.

---

# 56. Collaboration

Un propriétaire d’événement peut inviter d’autres personnes dans son espace de gestion.

Rôles possibles :

### Propriétaire

Contrôle complet.

### Administrateur événement

Presque tous les droits sauf suppression du propriétaire ou facturation sensible.

### Éditeur

Peut modifier l’invitation et le contenu.

### Gestionnaire invités

Accès RSVP et invités.

### Gestionnaire médias

Accès photo, vidéo et audio.

### Lecture seule

Consultation uniquement.

---

# 57. Professionnels de l’événement

MyEvents doit également être pensé pour :

- wedding planners ;
- agences événementielles ;
- entreprises ;
- associations ;
- organisateurs professionnels.

Un compte professionnel peut gérer :

- plusieurs événements ;
- plusieurs clients ;
- plusieurs collaborateurs ;
- modèles internes ;
- identité visuelle ;
- historique ;
- droits d’accès.

À terme, un professionnel pourrait disposer de son propre **Brand Kit** :

- logo ;
- couleurs ;
- polices ;
- composants récurrents.

---

# 58. Notifications

Centre de notifications interne.

Exemples :

- nouvel RSVP ;
- nouvel audio ;
- nouvelles photos ;
- nouvelle vidéo ;
- stockage presque plein ;
- tâche arrivant à échéance ;
- paiement reçu ;
- impression validée ;
- commande expédiée ;
- collaborateur ajouté.

Canaux configurables :

- plateforme ;
- e-mail ;
- éventuellement push.

---

# 59. Automatisations

Exemples :

### RSVP

Si aucune réponse après X jours :

→ proposer une relance.

### Événement

J-30 :

→ rappel organisation.

### Stockage

90 % :

→ proposer extension.

### Après événement

H+24 :

→ ouverture de la galerie collaborative si activée.

→ envoi de l’e-mail aux invités concernés.

### Remerciements

J+2 :

→ proposer la création de cartes de remerciement.

Ces délais doivent être configurables.

---

# 60. Paiement et commandes

Le système doit gérer :

- panier ;
- produits ;
- packs ;
- options ;
- réductions ;
- codes promotionnels ;
- taxes ;
- factures ;
- paiements ;
- remboursements éventuels.

Une commande peut contenir plusieurs éléments.

Exemple :

```text
Invitation digitale
QR Audio
QR Photo/Vidéo
100 cartes de remerciement
Plexiglas premium
+3 Go de stockage
```

---

# 61. Back-office MyEvents

Un back-office administrateur est indispensable.

Il doit permettre de gérer :

## Utilisateurs

- comptes ;
- statut ;
- stockage ;
- événements ;
- commandes.

## Événements

- consultation ;
- statut ;
- signalement ;
- assistance.

## Produits

- création ;
- prix ;
- options ;
- disponibilité.

## Packs

- composition ;
- prix ;
- promotion.

## Impression

- commandes ;
- matériaux ;
- formats ;
- quantités ;
- statuts.

## Modèles

- création ;
- validation ;
- catégories ;
- publication.

## Bibliothèque

- textes ;
- animations ;
- thèmes ;
- icônes ;
- ressources.

## Stockage

- consommation ;
- quotas ;
- extensions.

## Paiements

- commandes ;
- transactions ;
- remboursements ;
- factures.

---

# 62. Gestion des commandes physiques

Statuts possibles :

- brouillon ;
- paiement en attente ;
- payée ;
- fichier à vérifier ;
- validée ;
- en impression ;
- imprimée ;
- expédiée ;
- livrée ;
- problème.

L’administrateur doit pouvoir télécharger les fichiers prêts pour impression.

---

# 63. Préflight impression

Avant validation d’une carte, le système vérifie :

- dimensions ;
- fond perdu ;
- résolution ;
- zones de sécurité ;
- texte coupé ;
- QR code suffisamment grand ;
- QR code lisible ;
- qualité des images.

Une prévisualisation doit afficher les zones :

- découpe ;
- sécurité ;
- fond perdu.

---

# 64. Gestion des QR codes dans les créations physiques

Lorsque le client possède QR Audio ou QR Photo/Vidéo, les éléments correspondants apparaissent dans son éditeur.

Ils peuvent être :

- déplacés ;
- redimensionnés dans certaines limites ;
- intégrés à une carte ;
- intégrés à un chevalet ;
- intégrés à un panneau.

Le moteur doit empêcher de réduire un QR code au point de le rendre inutilisable.

Une vérification automatique doit être effectuée avant impression.

---

# 65. Sécurité des liens

Les liens privés ne doivent jamais utiliser des identifiants séquentiels facilement devinables.

Les URLs doivent être générées avec des identifiants sécurisés.

Possibilités :

- lien public ;
- lien privé ;
- mot de passe ;
- expiration ;
- désactivation.

---

# 66. Sécurité des médias

Les médias privés ne doivent pas être accessibles simplement en devinant leur URL.

Il faut prévoir :

- contrôle d’accès ;
- URLs temporaires lorsque nécessaire ;
- stockage privé ;
- droits par événement ;
- droits par utilisateur.

---

# 67. Protection des données

MyEvents manipulera :

- noms ;
- e-mails ;
- téléphones ;
- photos ;
- vidéos ;
- voix ;
- informations RSVP.

La plateforme doit donc intégrer dès sa conception :

- consentement ;
- politique de confidentialité ;
- export des données ;
- suppression ;
- durée de conservation ;
- gestion des accès ;
- traçabilité des actions sensibles.

Le créateur doit également être encouragé à ne demander dans le RSVP que les informations réellement nécessaires.

---

# 68. Cycle de vie d’un événement

Un événement doit avoir un véritable cycle.

## Avant

- création ;
- invitation ;
- RSVP ;
- organisation ;
- rappels.

## Pendant

- consultation ;
- programme ;
- itinéraires ;
- QR Audio ;
- QR Photo/Vidéo ;
- contribution.

## Après

- souvenirs ;
- galerie ;
- téléchargements ;
- remerciements ;
- impression ;
- archivage.

La plateforme doit être conçue autour de ces trois périodes.

---

# 69. Expérience après l’événement

Après la fin de l’événement, le dashboard peut automatiquement évoluer.

Au lieu de mettre en avant :

- RSVP ;
- préparation ;
- planning ;

il met davantage en avant :

- souvenirs ;
- galerie ;
- audios ;
- téléchargement ;
- cartes de remerciement ;
- statistiques ;
- archivage.

---

# 70. Recherche globale

À terme, une recherche globale doit permettre de retrouver :

- événement ;
- invité ;
- fichier ;
- audio ;
- photo ;
- commande ;
- tâche ;
- prestataire.

---

# 71. Moteur de modèles universel

Il ne faut pas créer une application techniquement différente pour chaque événement.

Un mariage, une conférence ou un anniversaire utilisent le même moteur.

Ce qui change est de la configuration :

- sections proposées ;
- textes ;
- thèmes ;
- formulaires ;
- illustrations ;
- modèles.

Cela garantit que MyEvents reste évolutif.

---

# 72. Structure fonctionnelle générale

```text
MyEvents
│
├── Site public
│   ├── Landing
│   ├── Produits
│   ├── Packs
│   ├── Inspiration
│   ├── Démonstrations
│   ├── Tarifs
│   └── FAQ
│
├── Authentification
│
├── Dashboard
│   ├── Mes événements
│   ├── Créer un événement
│   ├── Commandes
│   ├── Stockage
│   └── Profil
│
├── Événement
│   ├── Vue d’ensemble
│   ├── Studio
│   ├── Invités
│   ├── RSVP
│   ├── Organisation
│   ├── Budget
│   ├── Planning
│   ├── Prestataires
│   ├── Audio
│   ├── Photos / Vidéos
│   ├── Cartes
│   ├── Produits personnalisés
│   ├── Collaborateurs
│   ├── Statistiques
│   └── Paramètres
│
├── Expérience invité
│   ├── Invitation digitale
│   ├── RSVP
│   ├── QR Audio
│   ├── QR Photo / Vidéo
│   └── Galerie collaborative
│
└── Administration
    ├── Utilisateurs
    ├── Événements
    ├── Produits
    ├── Packs
    ├── Templates
    ├── Commandes
    ├── Impression
    ├── Stockage
    ├── Paiements
    └── Support
```

---

# 73. Objets fonctionnels principaux

La conception technique devra au minimum prévoir des entités correspondant à :

```text
User
Workspace
Event
EventMember
Invitation
InvitationVersion
Template
Theme
Section
Component
Guest
GuestGroup
RSVPForm
RSVPField
RSVPSubmission
Location
ScheduleItem
Task
BudgetItem
Vendor
MediaSpace
MediaAsset
AudioMessage
QRCode
Collaborator
Product
Pack
ProductOption
PrintProduct
Material
Order
OrderItem
Payment
StorageQuota
StorageAddon
Notification
AuditLog
```

Cette structure permet d’éviter de reconstruire la plateforme lorsqu’un nouveau produit est ajouté.

---

# 74. Fonctionnalités Studio supplémentaires indispensables

Le Studio devra également prévoir :

- duplication d’un bloc ;
- copier/coller ;
- verrouillage d’un bloc ;
- masquer/afficher ;
- ordre des calques ;
- groupement ;
- alignement ;
- grille ;
- guides ;
- snap ;
- sélection multiple lorsque pertinent ;
- bibliothèque de médias ;
- recadrage ;
- filtres légers ;
- suppression d’arrière-plan à terme ;
- historique ;
- raccourcis clavier ;
- aperçu plein écran.

---

# 75. Design System

MyEvents doit disposer de son propre système de design.

Les thèmes devront utiliser des variables globales :

- couleur principale ;
- couleur secondaire ;
- couleur accent ;
- fond ;
- texte ;
- titre ;
- police titre ;
- police texte ;
- rayon ;
- ombres ;
- espacement.

Ainsi, changer le thème principal peut mettre à jour automatiquement l’ensemble de l’invitation.

L’utilisateur garde ensuite la possibilité de modifier chaque section individuellement.

---

# 76. Import des médias

Un gestionnaire central de médias doit permettre :

- upload ;
- recherche ;
- réutilisation ;
- classement ;
- suppression ;
- informations de taille ;
- compression.

Un même fichier ne doit pas être dupliqué inutilement lorsqu’il est utilisé dans plusieurs sections.

---

# 77. Partage de prévisualisation

Avant publication, le créateur peut générer un lien temporaire d’aperçu.

Il peut ainsi montrer l’invitation à :

- conjoint ;
- client ;
- entreprise ;
- collaborateur.

Le lien peut être :

- limité dans le temps ;
- protégé par mot de passe ;
- désactivé.

---

# 78. Expérience professionnelle

Pour un organisateur professionnel, il doit être possible à terme de créer :

```text
Workspace Agence
├── Client A
│   └── Événement
├── Client B
│   └── Événement
└── Client C
    └── Événement
```

Les droits doivent empêcher un client d’accéder aux événements des autres clients.

---

# 79. Recherche d’inspiration

La bibliothèque doit permettre une recherche visuelle.

Filtres :

- occasion ;
- style ;
- couleurs ;
- format ;
- animation ;
- ambiance ;
- typographie.

Un modèle peut être :

- prévisualisé ;
- enregistré en favori ;
- utilisé ;
- dupliqué.

---

# 80. Favoris

L’utilisateur peut ajouter aux favoris :

- modèles ;
- typographies ;
- palettes ;
- animations ;
- mises en page.

Il retrouve ensuite ses favoris dans le Studio.

---

# 81. Présets

Le Studio doit proposer des présets rapides.

Exemple :

**Élégant**

- palette ;
- typographie ;
- animations ;
- boutons ;
- séparateurs.

**Minimaliste**

autre combinaison.

**Festif**

autre combinaison.

Ces présets accélèrent la création tout en restant entièrement personnalisables.

---

# 82. Intelligence et assistance à la création

À terme, une assistance intelligente peut être ajoutée.

Elle pourrait proposer :

- textes ;
- formulations ;
- palettes ;
- combinaisons ;
- structures ;
- suggestions RSVP ;
- amélioration d’un texte ;
- traductions.

Elle doit assister le client sans rendre toutes les créations identiques.

La création manuelle doit toujours rester possible.

---

# 83. Principe UX fondamental

Un utilisateur doit pouvoir obtenir une invitation correcte sans être designer.

Le Studio doit donc fonctionner selon deux niveaux :

### Mode simple

- modèles ;
- choix guidés ;
- palettes ;
- sections préconfigurées.

### Mode avancé

- propriétés détaillées ;
- ajustements individuels ;
- animations ;
- styles ;
- mise en page plus libre.

Cela permet de servir aussi bien quelqu’un souhaitant créer en dix minutes qu’un utilisateur voulant travailler plusieurs heures sur son design.

---

# 84. Première version commercialisable — P0

La première véritable version ne doit pas essayer de développer toutes les idées simultanément.

Les fonctionnalités fondamentales sont :

1. Landing page.
2. Catalogue produits/packs.
3. Création de compte.
4. Gestion de plusieurs événements.
5. Studio d’invitation.
6. Bibliothèque de modèles.
7. Invitation par lien.
8. RSVP personnalisable.
9. Gestion des invités.
10. QR Audio.
11. QR Photo / Vidéo.
12. Gestion des médias.
13. Mode privé/collaboratif.
14. Export ZIP.
15. Gestion des quotas de stockage.
16. Paiement.
17. Profil.
18. Cartes de remerciement.
19. Commandes physiques.
20. Back-office.

---

# 85. Deuxième niveau — P1

Ensuite :

- budget ;
- tâches ;
- planning ;
- roadmap ;
- prestataires ;
- statistiques avancées ;
- collaboration avancée ;
- Brand Kit ;
- comptes professionnels ;
- historique complet ;
- automatisations ;
- produits imprimés supplémentaires.

---

# 86. Évolutions — P2

Plus tard :

- assistance IA ;
- génération de propositions ;
- recommandations intelligentes ;
- marketplace de modèles ;
- créateurs externes ;
- marketplace de prestataires ;
- application mobile native ;
- fonctionnalités professionnelles avancées ;
- white-label ;
- API ;
- intégrations externes.

---

# 87. Positionnement final

MyEvents ne doit pas être présenté comme :

> « un site pour créer une invitation ».

Le produit doit être présenté comme :

> **l’espace digital complet d’un événement, de sa préparation jusqu’à ses souvenirs.**

Le lien d’invitation constitue la porte d’entrée.

Le Studio construit l’expérience.

Le RSVP transforme l’invitation en outil de gestion.

Les QR codes relient l’événement physique à l’expérience numérique.

Les espaces audio, photo et vidéo conservent les souvenirs.

Le dashboard accompagne l’organisation.

Les cartes et produits physiques permettent de prolonger l’expérience hors ligne.

L’ensemble doit fonctionner avec une architecture modulaire afin qu’un client puisse acheter uniquement ce dont il a besoin, tandis qu’un autre peut utiliser MyEvents comme véritable plateforme centrale pour l’ensemble de son événement.

---

# 88. Règles produit à ne jamais perdre

1. **Une invitation digitale est un lien, pas un QR code.**
2. **Les QR codes servent aux espaces complémentaires, principalement Audio et Photo/Vidéo.**
3. **Chaque produit doit pouvoir être acheté séparément.**
4. **Les packs ne sont que des assemblages de produits.**
5. **Un compte peut gérer plusieurs événements.**
6. **Le Studio doit être accessible aux non-designers tout en restant puissant.**
7. **Toutes les sections doivent être personnalisables indépendamment.**
8. **La personnalisation ne doit jamais casser le responsive.**
9. **Le mobile est prioritaire.**
10. **Le formulaire RSVP est dynamique et son tableau de données l’est également.**
11. **Les espaces souvenirs doivent pouvoir être privés ou collaboratifs.**
12. **Le partage post-événement est contrôlé par le propriétaire.**
13. **Les créations clients restent privées par défaut.**
14. **Les supports physiques utilisent le même moteur de personnalisation.**
15. **Les matériaux, prix, packs et produits sont configurables depuis l’administration.**
16. **Le stockage est mesurable, exportable et extensible.**
17. **Le propriétaire doit pouvoir récupérer l’intégralité de ses données.**
18. **La plateforme doit fonctionner pour plusieurs types d’événements sans dupliquer le produit.**
19. **Avant, pendant et après l’événement doivent être considérés comme trois phases d’une même expérience.**
20. **Chaque nouvelle fonctionnalité doit renforcer cette logique plutôt que transformer MyEvents en accumulation de fonctions sans cohérence.**

# 89. Résumé du concept

MyEvents est une plateforme événementielle modulaire permettant à un particulier, une entreprise, une association ou un professionnel de l’événementiel de créer et gérer l’ensemble de l’expérience numérique liée à son événement.

Le client construit son invitation depuis un Studio visuel, la partage par lien, configure son RSVP, organise ses invités, ses lieux, son planning et son budget, puis peut connecter l’événement physique à MyEvents grâce aux QR Audio et Photo/Vidéo.

Pendant l’événement, les invités contribuent aux espaces souvenirs.

Après l’événement, le propriétaire retrouve les contenus collectés, peut ouvrir une galerie collaborative, exporter les souvenirs, créer des cartes ou objets personnalisés et commander leur impression.

MyEvents devient ainsi non pas une simple invitation digitale, mais **le système central de création, de gestion, d’interaction et de mémoire d’un événement**.
