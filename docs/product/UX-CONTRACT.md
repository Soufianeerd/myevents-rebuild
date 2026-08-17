# UX Contract

Source de vérité canonique : `docs/myevents/lib.js` et les fichiers `s-*.js` du Carrousel (notamment `s-states.js`).

## Patterns UX Transversaux Explicites

### Navigation Principale

- **Sidebar Desktop (`sb`)** : Menu de gauche avec logo, événement courant (switcher `sb-evt`), sections principales (groupe), profil utilisateur en bas (`sb-user`). État actif (`sb-it.on`) avec fond subtil or et texte ivoire.
- **Topbar (`tb`)** : Contient le breadcrumb (à gauche), la barre de recherche globale, le bouton de notifications (avec indicateur `.dot`), et l'avatar organisateur.
- **Page Header (`phead`)** : Structure standard comprenant un Titre (Serif `ttl`), un Sous-titre optionnel (`sub`), et les actions principales à droite (`acts`) sous forme de boutons.

### États d'Interface (Extrait de l'écran 44 / s-states.js)

- **Skeleton Loading** : Privilégié au lieu des spinners plein écran pour le chargement des données.
- **No Full-Screen Spinner** : Sauf exception (ex: initialisation app).
- **Autosave States** : Sauvegarde automatique avec indicateurs discrets (ex: "Enregistré" à côté du champ).
- **Long Operation Progress** : Les opérations longues doivent être quantifiées (ex: barres de progression ou indicateurs étapes) plutôt qu'indéterminées.
- **Useful Empty States** : Les états vides doivent inclure une illustration, une explication claire et un appel à l'action pour créer la première donnée (ex: créer un événement, inviter une personne).
- **No-Result Recovery** : Lors d'une recherche infructueuse, proposer un moyen de réinitialiser les filtres ou suggérer une alternative.
- **Corrective Form Errors** : Les erreurs de formulaire doivent être placées près des champs concernés, avec des instructions de correction.
- **Locked Feature / Upgrade State** : Les fonctionnalités non incluses dans le forfait (ex: Livre Audio pour le forfait digital simple) sont visibles mais verrouillées, avec un badge/bouton d'upgrade.
- **Entitlement Badges** : Affichage de badges pour clarifier ce qui est inclus ou Premium.
- **Destructive Confirmation** : Toute action destructrice (ex: supprimer un invité ou événement) requiert une modale de confirmation.
- **Toast/State Vocabulary** : Utilisation de messages toast éphémères pour les succès ou avertissements non bloquants.

### Composants Spécifiques

- **Studio (Écrans 18-22)** : Interface divisée en panneau latéral d'options (gauche/droite) et aperçu central (canvas). Drag & drop pour ordonner les sections. Rendu en temps réel.
- **Listes et Données (ex: Invités)** : Tableaux avec sélection multiple, filtres et actions groupées. Composant d'import CSV avec mapping de colonnes.
- **RSVP (Écran 27)** : Gestion de la réponse par foyer, statistiques consolidées.
- **Public / Mobile (Écrans 39-43)** : Expérience invité prioritairement sur mobile (largeur 390px). Navigation facilitée, grands tap-targets, RSVP simplifié étape par étape.
