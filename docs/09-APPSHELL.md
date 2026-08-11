# 09 - AppShell & Layout Applicatif

## Rôle de l'AppShell

L'`AppShell` constitue le socle visuel et structurel de l'application sécurisée MyEvent's. Son objectif est de fournir une interface homogène pour les utilisateurs connectés, incluant la navigation, les contrôles globaux, et l'accessibilité de base, sans aucune logique métier associée.

## Séparation des Routes (Publiques vs Applicatives)

La structure Next.js garantit que l'`AppShell` n'enveloppe **que** les routes applicatives.

- Les vues isolées, comme le Design System (`/design-system`), n'utilisent pas ce layout.
- Le routage passe par le route group `src/app/(app)/layout.tsx` pour confiner l'AppShell aux écrans pertinents.

## Composants Structurels

1. **Sidebar (Desktop)** : Barre latérale gauche persistante de 268px. Elle intègre les liens de navigation, le profil utilisateur et des informations de contexte de l'événement.
2. **Topbar** : Barre de contrôle supérieure. Elle inclut la recherche globale, les notifications, et le `UserMenu`.
3. **MobileNavigation & Drawer** : Sur mobile, la Sidebar est masquée. Un bouton "Hamburger" apparaît dans la Topbar pour déployer la Sidebar via le composant `Drawer` (Radix Dialog) en provenance du côté gauche.
4. **UserMenu** : Construit à partir de `@radix-ui/react-dropdown-menu`, ce composant assure l'affichage du menu profil, facturation, équipe et déconnexion. Les fonctionnalités natives de Radix garantissent son fonctionnement au clavier (Escape, flèches).

## Accessibilité et Navigation

- **SkipLink** : Le tout premier élément du layout. Il permet de passer la navigation (Sidebar/Topbar) pour atteindre directement le contenu principal (`#main-content`) via la tabulation. Il n'est visible que lors du focus.
- **Règles de Focus** : Les composants ont des états focus visuellement clairs, alignés sur les fondations de la Session 01.

## État Actif de Navigation

L'état actif (`isActive`) dans la Sidebar et MobileNavigation repose sur une utilitaire `isActiveRoute()` qui détermine si un lien est actif en comparant la route actuelle (`pathname`) à sa destination (`href`).
La logique gère à la fois les correspondances exactes ("exact match", ex: pour éviter que `/` s'allume partout) et les correspondances de section ("prefix match", ex: `/dashboard/settings` allume `/dashboard`).

## Séparation des Préoccupations

- **Aucune dépendance réseau** : L'`AppShell` et ses composants frères se contentent de données de démonstration temporaires (nom, avatar factice, statistiques mockées).
- **Indépendance** : À ce stade, le layout ne dépend d'aucun provider d'authentification ou base de données.
- **Réutilisation** : L'interface recycle nativement les composants visuels et règles établies dans le Design System (Session 01).
