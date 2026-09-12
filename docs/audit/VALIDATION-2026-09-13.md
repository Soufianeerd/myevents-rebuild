# MyEvents — Preuves et limites de validation

Audit du 13 septembre 2026, révision applicative `0f2863d`. Aucun correctif applicatif n'a été appliqué pendant cette phase. Les résultats ci-dessous décrivent le socle existant, pas une certification de mise en production.

## Résultat global

**Validation complète non acquise.** Le build, le lint, le typecheck et la cohérence des artefacts générés passent. La dernière exécution Vitest complète en série donne **86 tests réussis sur 87**, avec un dépassement du délai de 5 secondes dans la construction du container local. Le scénario événement présente par ailleurs un défaut fonctionnel reproduit que ces tests ne détectent pas.

| Vérification                                                                                      | Résultat observé                                           | Portée / limite                                                                                                         |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `corepack pnpm build`                                                                             | Réussi, code 0                                             | Next signale un accès filesystem dynamique élargissant le traçage ; le build ne détecte pas le détail événement cassé   |
| `corepack pnpm exec eslint .`                                                                     | Réussi, code 0                                             | Analyse statique                                                                                                        |
| `corepack pnpm typecheck`                                                                         | Réussi, code 0                                             | Analyse TypeScript                                                                                                      |
| `corepack pnpm product:check-generated`                                                           | Réussi, aucun drift                                        | Cohérence des documents générés                                                                                         |
| Vitest produit + architecture + unit + intégration, un worker, délai par défaut                   | 29 fichiers : 28 réussis, 1 échoué ; 86/87 tests réussis   | `createContainer` dépasse 5 s ; aucune différence d'assertion rapportée pour cet échec                                  |
| Relance ciblée ScryptPasswordHasher, createContainer et CreateEventUseCase, un worker, délai 30 s | 3 fichiers et 7 tests réussis                              | Diagnostic de sensibilité au délai ; ne remplace pas une suite complète verte dans sa configuration normale             |
| Contrats produit + architecture, environnement Node, délai 30 s                                   | 2 fichiers et 13 tests réussis                             | Configuration diagnostique ; les tests produit contrôlent surtout les artefacts et leur texte                           |
| E2E existants sur serveur d'audit isolé, Chromium, un worker                                      | 7 réussis / 4 échoués                                      | Configuration temporaire sur 3100 ; détails ci-dessous                                                                  |
| Relance E2E AppShell desktop/mobile                                                               | Mobile réussi ; desktop échoué avant l'assertion de layout | Attente de redirection après inscription dépassée ; cause non isolée                                                    |
| Audit navigateur complémentaire                                                                   | 24 observations de routes et états                         | Création de compte/événement locales, contrôle d'accès anonyme, captures et mesures desktop/mobile                      |
| WebKit                                                                                            | Non exécuté                                                | Binaire WebKit 2336 absent ; Safari n'est pas validé                                                                    |
| `pnpm check:full` canonique                                                                       | Non terminé avec succès                                    | Problème de résolution pnpm, puis exécution interrompue ; configuration E2E 3000 incompatible avec l'autre projet actif |

Une première exécution concurrente a subi plusieurs timeouts et erreurs de workers. Les nombres Vitest ci-dessus correspondent à la dernière exécution complète en série, et non à une addition des succès de plusieurs essais. La machine était fortement chargée ; cela peut contribuer aux délais, sans démontrer que tous les échecs sont exclusivement environnementaux.

Le contrôle final `corepack pnpm format:check` réussit sur le dépôt. Les liens relatifs des rapports ont été vérifiés et `git diff --check` ne signale pas d’erreur.

## Environnement et reproductibilité

- Le dépôt demande pnpm 10.34.5 ; `corepack pnpm --version` confirme cette version. La commande nue `pnpm` résout ici un fallback 11.19.0, y compris dans certains scripts imbriqués. La première tentative `pnpm check:full` a voulu préparer une autre version puis s'est arrêtée sans TTY. Aucune réinstallation de dépendances n'a été effectuée.
- Node observé : 24.1.0 ; README : 22.22.3. R0 doit stabiliser la chaîne d'exécution documentée avant de qualifier la CI.
- Le port 3000 hébergeait un autre projet. Il n'a pas été arrêté ni utilisé comme application cible des tests MyEvents.
- Serveur de développement MyEvents sur 3100 et serveur de production sur 3101, tous deux avec données synthétiques dans `/tmp/myevents-phase0/data`. Aucun changement de configuration E2E n'a été committé pendant l'audit.

Commandes des diagnostics reproductibles depuis le dépôt :

```sh
corepack pnpm exec vitest run tests/product tests/architecture tests/unit tests/integration --maxWorkers=1
corepack pnpm exec vitest run tests/unit/providers/local/auth/ScryptPasswordHasher.test.ts tests/integration/server/container/createContainer.test.ts tests/unit/core/events/CreateEventUseCase.test.ts --maxWorkers=1 --testTimeout=30000
APP_MODE=local LOCAL_DATA_DIR=/tmp/myevents-phase0/data APP_URL=http://localhost:3100 corepack pnpm dev --hostname 127.0.0.1 --port 3100
```

Pour les relances ciblées, retrouver les chemins exacts des tests avec `rg --files tests` avant exécution. Pour reproduire la mailbox de production, construire l'application puis lancer `corepack pnpm start` sur 3101 avec le même mode local et une APP_URL correspondante, puis consulter `/dev/mailbox` sans cookie.

Les logs bruts et scripts ponctuels restent dans `/tmp/myevents-phase0*`. Ils ne sont pas livrés dans Git : certains tests existants écrivent le contenu de leur base synthétique, notamment des hashes de mots de passe. Les preuves durables sélectionnées dans [evidence](./evidence/) excluent le contenu de la mailbox et les tokens de reset.

## Détail des E2E

Sept scénarios passent lors de l'exécution initiale adaptée : skip link ; UserMenu au clavier ; inscription/déconnexion/connexion avec audit d'accessibilité ; email déjà inscrit ; design system avec axe et snapshot ; débordement mobile du design system ; page d'accueil.

Les quatre échecs sont distincts :

1. AppShell desktop : inscription du `beforeEach` sans arrivée sur dashboard dans les 20 secondes. La relance échoue au même endroit ; le layout desktop n'est donc pas validé par ce test.
2. AppShell mobile : même attente initiale dépassée. La relance réussit ensuite, y compris ouverture/fermeture du menu, axe et restitution du focus via Échap.
3. Reset : le test extrait exclusivement les liens absolus `localhost:3000`, alors que la mailbox de l'audit fournit correctement 3100. Ce test n'établit pas le bon fonctionnement du reset sur la configuration adaptée.
4. Isolation : le test attend le répertoire `.data-e2e`, alors que le serveur d'audit utilise explicitement un répertoire temporaire. Cette incompatibilité ne prouve pas une fuite inter-tenant. Le test existant ne couvre pas non plus un accès hostile à un ID appartenant à un autre tenant.

Les retries ne sont pas additionnés pour annoncer une suite verte. R0 doit rendre port, APP_URL, données et cycle de vie du serveur cohérents, puis relancer la suite canonique sans réutilisation d'un serveur étranger.

## Défauts fonctionnels reproduits

### F01 — Détail événement

Inscription synthétique → dashboard → création d'événement réussie → événement visible dans la liste → ouverture de son URL : **404**. Le log de développement signale l'accès synchrone à `params.id` alors que Next fournit une Promise. La capture [détail](./evidence/event-detail.png) et les observations de [routes](./evidence/routes.json) accompagnent le diagnostic. Tester ensuite un ID connu, un ID absent et un ID d'un autre tenant.

### F02 — Mailbox en production

Après build réussi, `/dev/mailbox` répond **HTTP 200 sans authentification sous `next start`** lorsque APP_MODE vaut local, son mode par défaut. Le contrôle du seul APP_MODE n'exclut donc pas cette route d'un déploiement public. Les mails locaux peuvent inclure des liens de reset. Aucune mailbox externe n'a été consultée.

### F03 — Champs sans nom accessible

Axe sur `/events/new` signale deux règles pour quatre contrôles : `label` sur la date/heure et `select-name` sur type, langue et fuseau. Les mesures enregistrées ne signalent pas de débordement horizontal à 390 px dans les états capturés ; elles ne remplacent pas une validation du zoom ou d'un clavier mobile.

### F04 — Token consommé après mot de passe invalide

Reproduction navigateur sur le compte synthétique local : demander un reset, ouvrir son lien, soumettre un mot de passe de 8–14 caractères, puis réutiliser le même lien avec un mot de passe respectant la politique de 15 caractères. Le premier est refusé par le domaine ; **le second est refusé parce que le token a déjà été consommé**. Le mot de passe du compte n'a pas été changé. Le code confirme l'ordre consommation puis validation et l'écart entre schéma de l'action et politique métier.

## Limites de cette phase

Aucun paiement, webhook, upload, RLS Supabase, publication d'invitation, RSVP MyEvents, commande physique ou contrôle admin ne peut être validé de bout en bout : les fonctionnalités correspondantes sont absentes. Les comptes externes de connecteurs n'ont pas tous été authentifiés. Aucun scan exhaustif de l'historique de secrets ni pentest n'a été effectué. Les références externes ont uniquement fait l'objet de lectures et d'interactions d'ouverture sans soumission.

Les features ne sont pas marquées `verified` sur la base de cet audit. Le [suivi de progression](../PROGRESS.md) maintient le Revenue Gate à **NON ATTEINT**.
