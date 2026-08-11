# Session 03: Core Architecture & Local Providers

Cette session établit le cœur de métier (Core) et l'infrastructure locale (Local Providers) en respectant les règles fixées : agnostique du framework et Local-First.

## Objectifs atteints

1. **Primitives du Core (`src/core`)** : 
   - `OpaqueId` pour un typage strict des identifiants (`UserId`, `TenantId`).
   - Pattern `Result<T, E>` pour une gestion d'erreurs prédictible sans exceptions.
   - `AppError` avec des codes standards.
   - `AccessContext` (`Anonymous`, `User`) avec utilitaires de vérification IDOR (`assertSameTenant`).

2. **Contrats d'Infrastructure (`src/providers/contracts`)** :
   - `Clock` (Source de temps).
   - `IdGenerator` (Génération d'identifiants).

3. **Providers Locaux (`src/providers/local`)** :
   - `SystemClock` et `CryptoIdGenerator`.
   - `LocalJsonStore<T>` : Persistance locale robuste.
     - Validation Zod (lecture et écriture).
     - Écritures atomiques via fichiers temporaires et `rename`.
     - File d'attente pour la gestion des écritures concurrentes dans le même processus.
     - Prévention du path traversal.

4. **Composition Root (`src/server/container`)** :
   - Assemblage conditionnel du container (mode `APP_MODE=local`).
   - Accès via singleton (`createContainer`).

5. **Validation et Tests** :
   - Tests d'architecture (`tests/architecture/core.test.ts`) empêchant l'import de React, Next, ou d'infrastructures locales dans le Core.
   - Tests unitaires et d'intégration robustes, couvrant les cas d'erreur de `LocalJsonStore`.

## Prochaines étapes

Le socle technique et l'injection de dépendance sont prêts. La prochaine session se concentrera sur l'implémentation du premier domaine métier (Event) et ses cas d'usage, en utilisant ce conteneur.
