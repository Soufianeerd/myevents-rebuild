# MyEvent's — Design System & Carrousel UI/UX

47 écrans haute fidélité couvrant l'intégralité du parcours : découverte → inscription → onboarding → création → Studio → invités → RSVP → envois → publication → QR codes → souvenirs → statistiques → remerciements → paramètres → expérience invité.

## Par où commencer

| Fichier                   | Usage                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `MyEvents-carrousel.html` | **Le carrousel navigable.** Sommaire cliquable, flèches ← → au clavier. Ouvrir dans un navigateur. |
| `png/`                    | Un PNG par écran, rendu en 2× (retina), prêt pour un carrousel LinkedIn / Behance / Dribbble.      |
| `screens/`                | Un fichier HTML autonome par écran, à la dimension exacte de la maquette.                          |
| `ds.css`                  | Le design system complet : tokens, typographies, composants.                                       |

Le carrousel fonctionne hors ligne — les quatre polices sont embarquées dans `fonts/`.

## Les 47 écrans

**A · Site public** — 01 Homepage · 02 Fonctionnalités · 03 Galerie de templates · 04 Détail d'un template · 05 Tarifs · 06 Wedding planners (B2B) · 07 Exemples & inspiration · 08 FAQ

**B · Authentification** — 09 Connexion · 10 Inscription · 11 Mot de passe oublié

**C · Onboarding** — 12a Type d'événement · 12b Date · 12c Style · 12d Première invitation générée

**D/E · Dashboard & Événement** — 13 Dashboard · 14 Mes événements · 15 Créer un événement · 16 Détail événement · 17 Programme & sous-événements

**F · Studio** — 18 Sélection du template · 19 Studio principal · 20 Style global · 21 Animations · 22 Historique de versions

**G→J · Invités, RSVP, Envois, Analyse** — 23 Invités (CRM) · 24 Fiche invité (drawer) · 25 Foyers & groupes · 26 Import CSV · 27 Gestion RSVP · 28 Centre d'envois · 29 Statistiques

**K→P · Souvenirs, Offres, Paramètres** — 30 QR Codes · 31 Photos & vidéos · 32 Livre d'or audio · 33 Éditeur carte de remerciement · 34 Offres & produits · 35 Profil & préférences · 36 Équipe & rôles · 37 Facturation · 38 Confidentialité

**Q · Expérience invité (mobile-first)** — 39 Invitation publiée · 40 RSVP invité · 41 Enregistrement audio · 42 Dépôt photo/vidéo · 43 Galerie privée

**Design system** — 44 Planche des états UI

## Direction artistique

Quiet luxury digital product. Le bordeaux porte l'identité, le doré ne sert qu'aux accents : bordures actives, boutons premium, détails, icônes sélectionnées.

**Palette**

| Rôle             | Valeur                                                                     |
| ---------------- | -------------------------------------------------------------------------- |
| Bordeaux profond | `#7A1F2B` (900 `#4A121A` → 50 `#FBF3F4`)                                   |
| Doré élégant     | `#D4B07B` (700 `#9C7742` → 50 `#FBF6EC`)                                   |
| Ivoire           | `#F9F7F2`                                                                  |
| Noir chaud       | `#1C1614`                                                                  |
| Neutres chauds   | `#FCFBF8` → `#1C1917` (12 valeurs)                                         |
| Sémantique       | succès `#2F7A55` · attention `#B0762A` · erreur `#A32F2F` · info `#3A5F86` |

**Typographies**

- **Cormorant Garamond** — éditorial, titres marketing, éléments émotionnels
- **Inter** — toute l'interface fonctionnelle
- **Great Vibes** — réservé aux prénoms des mariés
- **Amiri** — textes en arabe (versets, calligraphie)

**Formes** — rayons 10 à 16 px · bordures 1 px · ombres très légères (4 niveaux) · échelle d'espacement sur base 4 · icônes outline 1,6 px, jamais d'emoji.

**Grille** — desktop 1440, 12 colonnes, gouttière 24, marges 80. Studio : 300 / fluide / 340. Invité : mobile-first 390.

## Données fictives

Aucune donnée personnelle réelle. Toutes les vues partagent le même jeu fictif, cohérent d'un écran à l'autre :

**Yasmine & Adam** — familles **Nadari** et **Ferrand** · Mariage · **samedi 6 juin 2026** · Aix-en-Provence (mairie) et Le Tholonet (Domaine des Oliviers) · 126 invités répartis en 42 foyers · 137 personnes attendues · 84 présents, 12 absents, 30 en attente · clôture des réponses le 1ᵉʳ mai 2026 · 91 % d'ouverture, 76 % de réponse · 186 photos et vidéos, 32 messages audio.

Tous les e-mails sont en `@exemple.com`, les adresses et numéros de téléphone sont inventés.

## Fichier Figma

Le design system a également été construit dans Figma avant que le quota MCP du plan Starter ne soit atteint :
[MyEvent's — Design System & Carrousel UI/UX](https://www.figma.com/design/bytVKFTOZWQqe8w7qb0k1X)

Il contient 52 variables, 24 styles de texte, 5 styles d'ombre, 69 icônes en composants, les composants `App/Sidebar` et `App/Topbar`, une planche « Atomes & molécules » et le composant d'invitation complet (7 blocs, 390 × 2637).

⚠️ Le fichier Figma porte encore l'ancien jeu de données. À reprendre au prochain passage.

## Régénérer

```bash
node build.js     # reconstruit screens/ et MyEvents-carrousel.html
node shot.js      # régénère les PNG (nécessite playwright-core + chromium)
node shot.js 19   # un seul écran
```

Les écrans vivent dans `s-public.js`, `s-app.js`, `s-studio.js`, `s-guests.js`, `s-memories.js`, `s-mobile.js`, `s-states.js`. Les briques partagées (icônes, sidebar, topbar, invitation, QR, cartes) sont dans `lib.js`.
