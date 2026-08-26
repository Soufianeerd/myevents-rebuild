# Index de Gouvernance (Product Contract)

Ce document est l'Index de Gouvernance de MyEvents.
Le carrousel de maquettes ne constitue pas le Product Master fonctionnel à lui seul.

## Hiérarchie des Sources de Vérité

### 1. PRODUCT-SPEC = WHAT (Source Primaire)
- Source primaire : `docs/product/source/MYEVENTS_CAHIER_DES_CHARGES.md`
- Index exploitable : [PRODUCT-SPEC](./PRODUCT-SPEC.md)
- Traçabilité : [SPEC-TRACEABILITY](./SPEC-TRACEABILITY.md)
- Domaine : [DOMAIN-MAP](./DOMAIN-MAP.md)

### 2. DECISION-REGISTER
- [DECISION-REGISTER](./DECISION-REGISTER.md) : Seules les décisions explicitement validées par le propriétaire modifient le cahier des charges.

### 3. UI/UX REFERENCE = HOW IT LOOKS / HOW IT FEELS
- **docs/myevents/** (Carrousel, JS, CSS)
- Définit la direction artistique, layouts, hiérarchie, responsive, etc.
- Ne définit pas les entités métier, cycles de vie, ou autorisations.
- [UI-GAPS](./UI-GAPS.md) : Identifier les gaps de design avant implémentation.

### 4. LEGACY PROTOTYPE = ORIGINAL EXPERIENCE REFERENCE
- [LEGACY-PROTOTYPE](./LEGACY-PROTOTYPE.md) : Référence d'expérience (portes, sceau, expérience verticale, etc.).

### 5. ARCHITECTURE = HOW IT IS BUILT
- `docs/01-ARCHITECTURE.md` : Server Actions, Zod, Domain, Local-first, Core pur.
- `docs/02-LOCAL-FIRST.md`

### 6. EXTERNAL STANDARDS
- WCAG 2.2 AA (Accessibilité), OWASP (Sécurité), Standards Web, Next.js best practices.

### 7. ROADMAPS
- [08-ROADMAP-DETAILED](../08-ROADMAP-DETAILED.md)
- `docs/07-ROADMAP.md`

En cas de contradiction, voir le [CONFLICT-REGISTER](./CONFLICT-REGISTER.md).
