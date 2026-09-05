# Product Specification

Cette spécification est la couche indexée du cahier des charges principal de MyEvents.
Elle permet de mapper les exigences fonctionnelles vers le code, la roadmap et les tests.

## 1. Source Canonique

La source primaire et immuable est : `docs/product/source/MYEVENTS_CAHIER_DES_CHARGES.md`.
Ce document ne remplace pas la source, il l'indexe.

## 2. P0 - Première version commercialisable (Réf: §84)

1. Landing page
2. Catalogue produits/packs
3. Création de compte
4. Gestion de plusieurs événements
5. Studio d'invitation
6. Bibliothèque de modèles
7. Invitation par lien
8. RSVP personnalisable
9. Gestion des invités
10. QR Audio
11. QR Photo / Vidéo
12. Gestion des médias
13. Mode privé/collaboratif
14. Export ZIP
15. Gestion des quotas de stockage
16. Paiement
17. Profil
18. Cartes de remerciement
19. Commandes physiques
20. Back-office

## 3. Règles Produit Immutables (Réf: §88)

Ces règles doivent rester immédiatement visibles pour tous les futurs agents.

- **RULE-001** : Une invitation digitale est un lien, pas un QR code.
- **RULE-002** : Les QR codes servent principalement aux espaces Audio et Photo/Vidéo.
- **RULE-003** : Chaque produit peut être acheté séparément.
- **RULE-004** : Un pack n'est qu'un assemblage commercial de produits.
- **RULE-005** : Un compte peut gérer plusieurs événements.
- **RULE-006** : Le Studio reste simple pour un non-designer tout en offrant un mode avancé.
- **RULE-007** : Les sections sont personnalisables indépendamment.
- **RULE-008** : La personnalisation ne doit pas casser le responsive.
- **RULE-009** : Mobile-first.
- **RULE-010** : RSVP dynamique et tableau dynamique.
- **RULE-011** : Souvenirs privés ou collaboratifs.
- **RULE-012** : Partage post-event contrôlé par le propriétaire.
- **RULE-013** : Créations clients privées par défaut.
- **RULE-014** : Même moteur générique pour supports physiques personnalisés.
- **RULE-015** : Produits, packs, matériaux et prix administrables.
- **RULE-016** : Stockage mesurable, exportable, extensible.
- **RULE-017** : Récupération complète des données.
- **RULE-018** : Moteur universel multi-types d'événements.
- **RULE-019** : Avant / Pendant / Après constituent une même expérience.
- **RULE-020** : Toute nouvelle feature doit renforcer l'écosystème cohérent MyEvents.
