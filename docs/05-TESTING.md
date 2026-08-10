# 05 Testing

L'application est testée rigoureusement à tous les niveaux.

- **Tests unitaires** (`tests/unit/`) : Vitest. Pour tester la logique pure, les fonctions pures du domaine, etc.
- **Tests d'intégration** (`tests/integration/`) : Vitest. Pour tester l'assemblage de composants, requêtes, actions serveur.
- **Tests E2E** (`tests/e2e/`) : Playwright + Chromium (de référence). Test de l'application dans un vrai navigateur.

Les catégories doivent être réellement séparées et exécutées via des scripts distincts.
Ne pas faire passer des tests d'intégration dans la suite unitaire, ou inversement.
