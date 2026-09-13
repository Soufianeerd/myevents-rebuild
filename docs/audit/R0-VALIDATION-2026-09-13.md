# R0 — Socle Auth/Event et préparation Preview persistante

13 septembre 2026. Reprise de la session interrompue sur la branche `codex/r0-deployment-readiness`. Autorisation de déploiement : DEC-DEP-001. Références : PRODUCT-SPEC §6/24/25/68/78/84, AUTH-09/10/11, EVENT-14/15/16, PROD-13-001, Security et Accessibility Contracts.

## Périmètre livré

Le mode local permet de créer un compte, se connecter, réinitialiser son mot de passe puis créer, ouvrir, modifier et supprimer logiquement ses événements. Les actions valident les entrées côté serveur et recalculent l'identité à chaque soumission. Le mode connecté utilise Supabase Auth et PostgreSQL ; les adapters locaux restent réservés au développement.

| Contrôle                                                    | État                                                        | Preuves                                                                                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 / F06 — détail, modification et suppression             | verified local                                              | `tests/e2e/events.test.ts`, `tests/integration/providers/local/EventIsolation.test.ts`                                                         |
| F02 — mailbox fermée sous next start                        | verified local production build                             | `tests/e2e/events.test.ts` ; 404, données de test isolées                                                                                      |
| F03 — labels, erreurs et formulaire accessibles             | verified local                                              | Axe dans `tests/e2e/events.test.ts`, `tests/e2e/auth.test.ts`                                                                                  |
| F04 — validation du mot de passe avant consommation du lien | verified local + adapter simulé                             | `tests/unit/core/auth/usecases/ResetPasswordUseCase.test.ts`, `tests/unit/providers/supabase/Authentication.test.ts`, `tests/e2e/auth.test.ts` |
| F05 — bornes et limitation des tentatives                   | verified local ; limites GoTrue à valider en staging        | `tests/integration/providers/local/LocalAuthAttemptLimiter.test.ts` ; limites globales et par identité                                         |
| F07 — dates et fuseaux                                      | verified local                                              | `tests/unit/core/events/dates.test.ts` ; Paris hiver/été, Casablanca, Kathmandu, date invalide, heures ambiguës et inexistantes                |
| F08 — création concurrente de l'espace principal            | verified local                                              | `tests/integration/providers/local/EventIsolation.test.ts` ; 12 créations concurrentes                                                         |
| F09 — validation indépendante du serveur personnel          | verified local                                              | `scripts/run-e2e.mjs`, `playwright.config.ts` ; build puis serveur dédié sur 3200, données temporaires nettoyées                               |
| Isolation PostgreSQL et Storage                             | verified PostgreSQL embarqué ; services distants en attente | `tests/integration/supabase/Rls.test.ts` ; SQL exécuté dans PGlite, rôles non privilégiés, identités immuables, accès croisés refusés          |
| F12 — configuration Preview                                 | préparée, déploiement non vérifié                           | `.env.example`, `vercel.json`, `docs/DEPLOYMENT.md`, `tests/unit/connected-env.test.ts`                                                        |

## Corrections complémentaires de cette reprise

- Exclusion des rapports Playwright et de couverture du lint : les bundles du visualiseur de traces ne sont pas du code applicatif.
- Attente explicite de la route événement dans le test E2E avant mémorisation de l'URL. Le rendu Next pouvait apparaître avant le changement d'URL.
- Suppression de la collecte de tout le dépôt par Turbopack pour le chemin des données locales. Les fichiers locaux sont des données d'exécution, pas des assets à livrer sur Vercel.
- Le contrôle du build connecté a ensuite détecté des mails locaux dans le manifeste de la mailbox, malgré sa 404 en production. Le chemin de cette route est également exclu de la collecte, avec exclusions explicites dans `next.config.ts`. `scripts/check-server-traces.mjs`, exécuté à chaque `pnpm build`, refuse un paquet contenant données locales, fichiers d'environnement ou rapports de test. Régression couverte dans `tests/integration/server/ServerTraces.test.ts`.
- Boutons de menu et d'utilisateur passés de 8 px à 36 px ; marges mobiles de 16 px. Les tokens personnalisés `--spacing-8` et `--spacing-4` ne correspondent pas aux dimensions Tailwind habituelles. La correction est limitée aux composants concernés.
- Header de la liste et actions du formulaire adaptables aux petits écrans ; retour à la ligne des noms et lieux longs ; contrôle du débordement du conteneur principal et de la taille des cibles tactiles.
- Date de création affichée explicitement en français dans le fuseau de l'événement.
- Configuration connectée refusant les clés Supabase privilégiées et exigeant des origines HTTPS en production. Le contrôle de type de clé prévient une erreur de configuration ; Supabase reste responsable de sa vérification cryptographique.
- Générateur de traçabilité conservant les chemins de preuve et les notes au lieu de fabriquer une preuve « Yes ». Routes événement corrigées dans la matrice.

## Comparaison visuelle

Référence consultée dans le navigateur : `docs/myevents/screens/15-creer-evenement.html`, issue du carrousel. Sources Auth et liste/détail également relues dans `docs/myevents/s-app.js`. Captures applicatives après correction :

- [Création mobile](./evidence/r0/event-create-mobile.png)
- [Détail mobile](./evidence/r0/event-detail-mobile.png)
- [Détail desktop](./evidence/r0/event-detail-desktop.png)

Inspection aux formats 390 × 844 et 1440 × 1000 : champs lisibles, menus visibles, mise en colonne sur mobile, cartes sans débordement. Les formulaires utilisent les primitives du design system et les boutons bordeaux. Les captures de non-régression Auth/AppShell/Design System passent sans remplacement des baselines.

La parité complète avec le carrousel n'est **pas** déclarée : aperçus, co-organisateurs, wizard, contenus de dashboard, navigation et contexte d'événement réels restent à implémenter. Les labels techniques de type/statut et le contexte de démonstration de la sidebar restent une dette connue. Les matrices historiques conservent `implemented_unverified` lorsqu'une exigence couvre aussi le staging ou une composition visuelle encore partielle.

## Validation

La commande de référence est `pnpm check:full` : formatage, lint, TypeScript, absence de dérive des matrices, contrat produit, architecture, unitaires, intégration, build de production et E2E Chromium. Résultat final : commande réussie, 119 tests (12 produit, 2 architecture, 67 unitaires, 24 intégration, 14 E2E). Le build connecté Preview avec configuration factice réussit également ; 18 manifestes serveur contrôlés sans données locales ni fichiers d’environnement.

Les E2E ont aussi été exécutés indépendamment : 14/14 réussis après corrections, avec Axe, navigation clavier et deux utilisateurs distincts. Le test d'isolation soumet un formulaire initialement ouvert par le propriétaire après remplacement de la session par celle d'un autre compte ; la mutation est refusée puis le propriétaire retrouve ses données inchangées.

## Limites et accès distants

La CLI Supabase permet de lister l'organisation et ses projets existants. Aucun projet MyEvents n'était présent lors de la vérification ; aucun projet tiers n'a été modifié. La connexion Vercel demandée au propriétaire est désormais disponible ; préparation du projet en cours. Aucun déploiement distant n'est présenté comme réalisé.

Le PostgreSQL embarqué ne valide ni GoTrue, ni SMTP, ni le serveur Storage Supabase. La réception des mails, le renouvellement/révocation des sessions, les RLS via de vrais JWT et la persistance après redéploiement doivent encore être vérifiés sur la Preview. `pnpm test:staging` exige deux comptes de test et échoue explicitement si sa configuration manque.

**Revenue Gate non atteint.** Ce jalon fiabilise le socle ; il ne livre pas encore le catalogue, le Studio, les invitations publiées, RSVP, paiements, médias, impression ou back-office.
