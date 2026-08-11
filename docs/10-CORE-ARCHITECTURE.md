# 10. Core Architecture

MyEvent's utilise une **Clean Architecture** stricte (Domain-Driven Design). 
Ce document précise les règles du socle métier.

## Principes

1. **Isolation Absolue du Core** : Le répertoire `src/core` contient la logique métier pure, le typage des entités et les règles de validation.
2. **Agnostique du Framework** : Le `core` n'importe *jamais* `react`, `next`, ou des composants de l'UI.
3. **Agnostique de l'Infrastructure** : Le `core` ne connaît ni la base de données, ni le filesystem, ni Supabase, ni Stripe. Il expose des contrats (interfaces) que les modules d'infrastructure implémentent.
4. **Programmation Défensive** : Le pattern `Result` est utilisé de façon extensive pour la gestion d'erreurs métier prédictible.

## Primitives du Core

- **`OpaqueId`** : Empêche la confusion entre différents types d'identifiants (ex: ne pas passer un `TenantId` à la place d'un `UserId`).
- **`Result<T, E>`** : Retour systématique pour les opérations qui peuvent échouer de manière métier (validation, métier, autorisation), évitant le `try/catch` sur des exceptions.
- **`AppError`** : Unification des erreurs avec un code précis (`NOT_FOUND`, `FORBIDDEN`, `VALIDATION_ERROR`, etc.).
- **`AccessContext`** : Injection du contexte de sécurité courant (`Anonymous` ou `User`). Chaque service du domaine exige ce contexte en paramètre pour valider les règles d'accès au niveau métier.

## Contrats et Providers

Toutes les dépendances externes sont abstraites par des contrats :

- **`Clock`** : Source de temps (permet le time-travel en test).
- **`IdGenerator`** : Génération des IDs.
- *(À venir)* `EventRepository`, `GuestRepository`, etc.

## Le Composition Root (Container)

Le `createContainer` (`src/server/container`) assemble l'application en instanciant les providers en fonction du mode de l'application (ex: local, production). Il est l'unique point qui a connaissance à la fois des contrats et des implémentations.
