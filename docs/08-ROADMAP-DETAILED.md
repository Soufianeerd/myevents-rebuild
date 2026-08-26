# Detailed Roadmap V2

## Principes
Couvrir l'intégralité de P0. Préserver : local-first, architecture par providers, vertical slices, tests, tenant isolation, shared renderer, responsive, accessibilité, sécurité.

## Milestones
- **MILESTONE A** — FIRST REAL MYEVENTS: signup → workspace/event → service selection → template → onboarding → Studio minimal → publish → public link
- **MILESTONE B** — RSVP: Guests → households → RSVP builder → individualized invitation → public RSVP → dashboard
- **MILESTONE C** — MEMORIES: entitlements → Audio QR → Audio contribution → Photo/Video QR → Media contribution → private/collaborative gallery
- **MILESTONE D** — COMMERCE: catalog → cart → fake payment → order → billing → storage addon
- **MILESTONE E** — PHYSICAL: thank-you design → print configuration → preflight → order lifecycle
- **MILESTONE F** — ADMIN: users, events, catalog, templates, print, storage, payments
- **MILESTONE G** — PRODUCTION ADAPTERS: real DB/Auth, payment, mail, storage, maps, automations

## Sessions Détaillées

### SESSION 05 — EVENT / WORKSPACE DOMAIN
- **Goal** : Event lifecycle foundation, tenant boundaries, multi-event.
- **Spec Sections** : §6, §24, §25, §68, §72, §73, §84 P0 #4, §88 (5, 18, 19, 20).
- **Priority** : P0
- **Domain Objects** : Workspace, Event, EventMember.

### SESSION 06 — COMMERCIAL CAPABILITY FOUNDATION
- **Goal** : Product, Pack, ProductOption, EventCapability. Local catalogue only.
- **Spec Sections** : §3, §4, §6, §60, §73, §88 (3, 4, 15), P0 #2.
- **Priority** : P0
- **Domain Objects** : Product, Pack, ProductOption.

### SESSION 07 — INVITATION MODEL FOUNDATION
- **Goal** : Block Registry, Editable draft vs published immutable representation.
- **Spec Sections** : §7-19, §41-46, §71, §73, §74, §75, §83.
- **Priority** : P0
- **Domain Objects** : Invitation, InvitationVersion, InvitationDocument, Template, Theme, Section, Component, PublishedSnapshot.

### SESSION 08 — UNIVERSAL MODEL / CULTURE / I18N FOUNDATION
- **Goal** : Moteur unique (Culture/Type = données). RTL.
- **Spec Sections** : §49, §71, §75, §88(18).
- **Priority** : P0

### SESSION 09 — SHARED INVITATION RENDERER
- **Goal** : Même renderer pour Studio preview et public invitation.

### SESSION 10 — ONBOARDING
- **Goal** : Couvrir les 4 étapes métier (Type, Infos, Services, Création).

### SESSION 11 — STUDIO MINIMUM VERTICAL SLICE
- **Goal** : Invitation éditable minimale (template, sections, content, theme, preview, autosave).

### SESSION 12 — PUBLICATION & PUBLIC INVITATION
- **Goal** : Draft → Publish → Snapshot → Public link → Renderer.

### SESSIONS STUDIO SUITE
- 13: Studio section ordering / DnD niveau 1
- 14: Common block properties
- 15: Identity / title / message blocks
- 16: Locations + programme
- 17: Calendar + countdown
- 18: Global background + readability
- 19: OpeningExperience
- 20: Music
- 21: Responsive overrides
- 22: Undo/redo/version history
- 23: Simple / Advanced mode
- 24: Preview sharing
- 25: Studio advanced tools / media library

### SESSIONS GUESTS / RSVP
- 26: Guest + GuestGroup
- 27: RSVPForm + RSVPField
- 28: Dynamic RSVP table/data
- 29: CSV / Excel import
- 30: Individualized household invitation
- 31: Public RSVP submission
- 32: Sending center / reminders
- 33: Basic invitation & RSVP analytics

### SESSIONS MEDIA / MEMORIES
- 34: QRCode generic foundation
- 35: MediaSpace + StorageQuota foundation
- 36: Audio guest experience
- 37: Audio owner management
- 38: Photo/Video guest experience
- 39: Media gallery
- 40: Privacy permissions
- 41: Collaborative mode
- 42: Moderation
- 43: Complete ZIP/data export

### SESSIONS COMMERCE
- 44: Cart / Order / OrderItem
- 45: Fake Payment
- 46: StorageAddon
- 47: Billing / invoices
- 48: Profile / purchased products / storage

### SESSIONS PHYSICAL PRODUCTS
- 49: Thank-you card editor
- 50: Generic PrintProduct engine
- 51: Material / formats / finishing / pricing
- 52: Physical order configuration
- 53: Print preflight
- 54: Physical QR safety
- 55: Physical order lifecycle

### SESSIONS ADMIN P0
- 56: Admin foundation + users/events
- 57: Admin products/packs/options
- 58: Admin templates/library
- 59: Admin materials/print catalog
- 60: Admin orders/print lifecycle
- 61: Admin storage
- 62: Admin payments/refunds/invoices

### SESSION LANDING
- Landing page publique finale, démos, etc.

### SESSIONS REAL PROVIDERS
- DB, Auth, Stripe, Cloud Storage, Mail, Maps (Post local P0).
