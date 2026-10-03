# MyEvent's — Consolidation canonique

## Statut

Ce dépôt `Soufianeerd/myevents-rebuild` est la **source de vérité canonique** pour MyEvent's.

Lignée produit :

1. `Soufianeerd/evoria` — première version fonctionnelle et laboratoire produit.
2. `Soufianeerd/myevents` — formalisation SaaS, architecture et roadmap de production.
3. `Soufianeerd/myevents-rebuild` — reconstruction canonique actuelle.

Les deux anciens dépôts sont des **sources legacy de connaissance**, pas des codebases sur lesquelles poursuivre le développement.

## Ce qu'il faut conserver d'Evoria

### Produit et expérience
- Invitations digitales premium.
- Studio de personnalisation de type Canva.
- Dashboard créateur.
- Événements mariage, anniversaire, baby shower, gala, soirée privée et autres.
- RSVP.
- QR codes physiques par événement.
- Livre d'or audio.
- Galerie collaborative photo/vidéo.
- Modération des médias.
- Espace invité mobile-first.
- Publication conditionnée au paiement.

### Modèle commercial historique
Référence historique :
- Invitation.
- Invitation + audio.
- Pack complet avec audio + photo/vidéo.

Les prix historiques d'Evoria sont des données de référence, pas des prix à recopier automatiquement dans la V2. Toute tarification doit passer par le domaine commercial du rebuild.

### Sécurité et backend
À conserver comme exigences :
- deny-by-default ;
- isolation stricte des données ;
- contrôle serveur des droits ;
- RLS ou mécanisme équivalent chez le provider retenu ;
- aucune clé service exposée au navigateur ;
- publication publique seulement si l'événement est autorisé et payé ;
- contrôle des capacités audio/photo selon les droits achetés ;
- stockage privé des médias sensibles ;
- webhooks Stripe idempotents.

### Direction artistique
Conserver le principe **Quiet Luxury** :
- éditorial, premium, émotionnel ;
- interface organisateur desktop ;
- interface invité mobile-first ;
- mouvement discret et utile ;
- invitation distincte du design system de l'application.

Les anciens tokens Evoria servent de référence, pas de contrainte absolue si le design system du rebuild les remplace explicitement.

## Ce qu'il faut conserver de l'ancien MyEvents

### Architecture SaaS
- organisations / memberships si le produit multi-utilisateur les requiert ;
- rôles et permissions ;
- sous-événements ;
- audit log ;
- jobs asynchrones ;
- webhooks persistés et idempotents ;
- observabilité ;
- CI obligatoire.

### Modèle invitation
- document d'invitation validé par schéma ;
- renderer partagé entre Studio et page publique ;
- versioning ;
- autosave ;
- undo/redo ;
- preview mobile/desktop ;
- templates/presets sans hardcoder les cultures.

### Gestion des invités
- foyers/groupes ;
- invités ;
- accompagnants ;
- affectation aux sous-événements ;
- import CSV avec dédoublonnage ;
- liens/tokens uniques ;
- RSVP groupé ;
- régimes/allergies/messages ;
- modification d'une réponse ;
- export traiteur.

### Commerce
- plans ;
- purchases ;
- entitlements/capabilities ;
- Checkout Stripe ;
- journalisation des paiements ;
- refunds/disputes ;
- factures ;
- kill switch de publication en cas de perte d'entitlement ;
- matrice fonctionnalité × plan × paiement.

### Communication et statistiques
- envois via provider email ;
- file d'envoi ;
- idempotence ;
- suivi des événements d'envoi ;
- relances ;
- statistiques RSVP et conversion.

### Médias
- uploads robustes ;
- reprise d'upload pour gros fichiers si nécessaire ;
- validation MIME réelle ;
- normalisation HEIC/EXIF ;
- traitement audio ;
- traitement vidéo ;
- quotas ;
- modération ;
- albums ;
- téléchargement groupé ;
- QR re-ciblables sans réimpression.

### Lancement
- CSP et headers ;
- rate limiting ;
- export/suppression RGPD ;
- purge réelle base + stockage ;
- sauvegardes/restauration testées ;
- accessibilité AA ;
- tests matériels iOS/Android ;
- SLO/performance mesurés.

## Architecture canonique du rebuild

La règle du rebuild reste prioritaire :

`UI → Server Action / Route Handler → Domain Service → Provider Contract → Adapter`

La consolidation **porte les capacités métier et les exigences**, pas un copier-coller de l'ancien code.

Si Evoria utilisait Supabase et l'ancien MyEvents prévoyait un autre stockage, le rebuild ne choisit pas implicitement l'un ou l'autre. Le domaine définit d'abord son contrat puis un adapter implémente le provider retenu.

## Produit canonique cible

MyEvent's doit converger vers ces domaines :

1. Accounts / Identity
2. Organizations / Workspaces
3. Events / Sub-events
4. Invitation Model
5. Templates / Themes
6. Shared Renderer
7. Studio
8. Publication
9. Guests / Households / Companions
10. RSVP
11. Commerce / Plans / Entitlements
12. Email / Notifications
13. QR
14. Audio Guestbook
15. Photo / Video Memories
16. Moderation / Gallery
17. Analytics
18. Privacy / Legal / Retention
19. Admin / Operations
20. B2B planners plus tard

## Règles de migration

- Ne jamais réintroduire du code legacy seulement parce qu'il fonctionne.
- Porter les comportements utiles derrière les contrats du rebuild.
- Ajouter les tests avant ou avec chaque capacité migrée.
- Conserver les assets réellement propriétaires et nécessaires.
- Ne jamais recopier des secrets ou des URLs privées depuis les anciens dépôts.
- Les différences culturelles, religieuses et traditionnelles restent des données/configurations.
- Le renderer Studio/public doit rester partagé.
- Les providers externes restent remplaçables.
- Toute ancienne décision incompatible avec l'architecture du rebuild doit être explicitement rejetée dans la documentation.

## Gate avant suppression des anciens dépôts

`evoria` et `myevents` pourront être supprimés/archivés seulement après :
- inventaire des assets uniques ;
- inventaire des migrations/SQL utiles ;
- inventaire des tests utiles ;
- récupération des textes métier réellement utiles ;
- validation qu'aucun déploiement actif ne dépend encore d'eux ;
- migration des secrets côté hébergeur, jamais dans Git ;
- validation que ce document et les docs du rebuild couvrent les décisions utiles.

Après cette gate, aucun nouveau développement ne doit avoir lieu dans les deux dépôts legacy.
