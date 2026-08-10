# 01 Architecture

L'architecture vise à séparer strictement le domaine métier de ses dépendances d'infrastructure, tout en tirant parti du App Router de Next.js.

Le flux de données standard est :
`UI → Server Action / Route Handler → Domain Service → Provider Contract → Adapter`

## Dossiers Clés

- `src/core/` : Types domaine, règles métier pures, schémas Zod, calculs. Aucune dépendance React, Next.js, API ou accès disque.
- `src/providers/contracts/` : Interfaces vers le monde extérieur (ex: AuthProvider, EventRepository).
- `src/providers/local/` : Implémentations locales de ces contrats pour la phase de bootstrap.
- `src/features/` : Fonctionnalités applicatives.
- `src/components/ui/` : Primitives visuelles réutilisables (Design System).
- `src/components/invitation/` : Renderer partagé de l'invitation (utilisé par Studio preview ET invitation publique).
