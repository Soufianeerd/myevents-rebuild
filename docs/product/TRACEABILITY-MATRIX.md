# Traceability Matrix

| Requirement ID | Screen | Source | Status | Implementation | Unit Tests | Integration Tests | E2E Tests | Visual Evidence | A11y Evidence | Security | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROD-01-001 | 01 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-01-002 | 01 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-01-003 | 01 | docs/myevents/s-public.js | verified | src/app/page.tsx | - | - | tests/e2e/home.test.ts, tests/e2e/events.test.ts | docs/audit/HOME-2026-09-20.md | tests/e2e/home.test.ts | - | CTA vers /events/new vérifié : visiteur redirigé vers connexion, parcours Auth/Event existant couvert. Landing commerciale globale encore partielle. |
| PROD-01-004 | 01 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-02-001 | 02 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-02-002 | 02 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-03-001 | 03 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-04-001 | 04 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-04-002 | 04 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-04-003 | 04 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-04-004 | 04 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-04-005 | 04 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-05-001 | 05 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-06-001 | 06 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-06-002 | 06 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-06-003 | 06 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-06-004 | 06 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-06-005 | 06 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-07-001 | 07 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| PROD-08-001 | 08 | docs/myevents/s-public.js | implemented_unverified | src/app/(auth)/connexion/page.tsx | - | - | tests/e2e/auth.test.ts | - | - | - | - |
| PROD-08-002 | 08 | docs/myevents/s-public.js | planned | - | - | - | - | - | - | - | - |
| AUTH-09-001 | 09 | docs/myevents/s-app.js | implemented_unverified | src/app/(auth)/mot-de-passe-oublie/page.tsx | tests/unit/providers/supabase/Authentication.test.ts, tests/unit/core/auth/usecases/ResetPasswordUseCase.test.ts | - | tests/e2e/auth.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | tests/e2e/auth.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | Socle fonctionnel verified en local (R0). Staging Supabase et parité visuelle complète non vérifiés ; statut global conservé. |
| AUTH-09-002 | 09 | docs/myevents/s-app.js | implemented_unverified | src/app/(auth)/actions.ts | tests/unit/providers/supabase/Authentication.test.ts, tests/unit/core/auth/usecases/ResetPasswordUseCase.test.ts | - | tests/e2e/auth.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | tests/e2e/auth.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | Socle fonctionnel verified en local (R0). Staging Supabase et parité visuelle complète non vérifiés ; statut global conservé. |
| AUTH-10-001 | 10 | docs/myevents/s-app.js | implemented_unverified | src/app/(auth)/inscription/page.tsx | tests/unit/providers/supabase/Authentication.test.ts, tests/unit/core/auth/usecases/ResetPasswordUseCase.test.ts | - | tests/e2e/auth.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | tests/e2e/auth.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | Socle fonctionnel verified en local (R0). Staging Supabase et parité visuelle complète non vérifiés ; statut global conservé. |
| AUTH-11-001 | 11 | docs/myevents/s-app.js | implemented_unverified | src/app/(auth)/reinitialiser-mot-de-passe/page.tsx | tests/unit/providers/supabase/Authentication.test.ts, tests/unit/core/auth/usecases/ResetPasswordUseCase.test.ts | - | tests/e2e/auth.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | tests/e2e/auth.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | Socle fonctionnel verified en local (R0). Staging Supabase et parité visuelle complète non vérifiés ; statut global conservé. |
| PROD-12a-001 | 12a | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| PROD-12b-001 | 12b | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| PROD-12c-001 | 12c | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| PROD-12d-001 | 12d | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| PROD-12d-002 | 12d | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| PROD-12d-003 | 12d | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| PROD-12d-004 | 12d | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| PROD-12d-005 | 12d | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| PROD-13-001 | 13 | docs/myevents/s-app.js | implemented_unverified | src/app/(app)/layout.tsx, src/components/layout/AppShell.tsx | - | - | tests/e2e/appshell.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | tests/e2e/appshell.test.ts | - | Cibles tactiles 36 px et marges mobile corrigées. Contexte et navigation de démonstration encore présents. |
| PROD-13-002 | 13 | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| PROD-13-003 | 13 | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| PROD-13-004 | 13 | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| EVENT-14-001 | 14 | docs/myevents/s-app.js | implemented_unverified | src/app/(app)/dashboard/page.tsx | tests/unit/core/events/dates.test.ts | tests/integration/providers/local/EventIsolation.test.ts | tests/e2e/events.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | tests/e2e/events.test.ts | tests/integration/supabase/Rls.test.ts | CRUD et isolation verified en local (R0). Staging et composition complète de la maquette en attente. |
| EVENT-14-002 | 14 | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| EVENT-14-003 | 14 | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| EVENT-14-004 | 14 | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| EVENT-15-001 | 15 | docs/myevents/s-app.js | implemented_unverified | src/app/(app)/events/EventForm.tsx, src/app/(app)/events/[id]/edit/page.tsx | tests/unit/core/events/dates.test.ts | tests/integration/providers/local/EventIsolation.test.ts | tests/e2e/events.test.ts | docs/audit/R0-VALIDATION-2026-09-13.md | tests/e2e/events.test.ts | tests/integration/supabase/Rls.test.ts | CRUD et isolation verified en local (R0). Staging et composition complète de la maquette en attente. |
| EVENT-15-002 | 15 | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| EVENT-16-001 | 16 | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| EVENT-17-001 | 17 | docs/myevents/s-app.js | planned | - | - | - | - | - | - | - | - |
| STUDIO-18-001 | 18 | docs/myevents/s-studio.js | planned | - | - | - | - | - | - | - | - |
| STUDIO-19-001 | 19 | docs/myevents/s-studio.js | planned | - | - | - | - | - | - | - | - |
| STUDIO-20-001 | 20 | docs/myevents/s-studio.js | planned | - | - | - | - | - | - | - | - |
| STUDIO-21-001 | 21 | docs/myevents/s-studio.js | planned | - | - | - | - | - | - | - | - |
| STUDIO-22-001 | 22 | docs/myevents/s-studio.js | planned | - | - | - | - | - | - | - | - |
| GUEST-23-001 | 23 | docs/myevents/s-guests.js | planned | - | - | - | - | - | - | - | - |
| GUEST-23-002 | 23 | docs/myevents/s-guests.js | planned | - | - | - | - | - | - | - | - |
| GUEST-23-003 | 23 | docs/myevents/s-guests.js | planned | - | - | - | - | - | - | - | - |
| GUEST-23-004 | 23 | docs/myevents/s-guests.js | planned | - | - | - | - | - | - | - | - |
| GUEST-24-001 | 24 | docs/myevents/s-guests.js | planned | - | - | - | - | - | - | - | - |
| GUEST-25-001 | 25 | docs/myevents/s-guests.js | planned | - | - | - | - | - | - | - | - |
| GUEST-26-001 | 26 | docs/myevents/s-guests.js | planned | - | - | - | - | - | - | - | - |
| RSVP-27-001 | 27 | docs/myevents/s-guests.js | planned | - | - | - | - | - | - | - | - |
| SEND-28-001 | 28 | docs/myevents/s-guests.js | planned | - | - | - | - | - | - | - | - |
| PROD-29-001 | 29 | docs/myevents/s-guests.js | planned | - | - | - | - | - | - | - | - |
| QR-30-001 | 30 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-31-001 | 31 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-32-001 | 32 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| SEND-33-001 | 33 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| BILLING-34-001 | 34 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| PROD-35-001 | 35 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| PROD-35-002 | 35 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| PROD-35-003 | 35 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| PROD-35-004 | 35 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| B2B-36-001 | 36 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| BILLING-37-001 | 37 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| BILLING-37-002 | 37 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| LEGAL-38-001 | 38 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| LEGAL-38-002 | 38 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| LEGAL-38-003 | 38 | docs/myevents/s-memories.js | planned | - | - | - | - | - | - | - | - |
| PUBLIC-39-001 | 39 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| PUBLIC-39-002 | 39 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| RSVP-40-001 | 40 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-41-001 | 41 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-41-002 | 41 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-41-003 | 41 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-41-004 | 41 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-41-005 | 41 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-42-001 | 42 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-42-002 | 42 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-42-003 | 42 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-42-004 | 42 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-42-005 | 42 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-43-001 | 43 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-43-002 | 43 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-43-003 | 43 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| MEDIA-43-004 | 43 | docs/myevents/s-mobile.js | planned | - | - | - | - | - | - | - | - |
| UX-44-001 | 44 | docs/myevents/s-states.js | planned | - | - | - | - | - | - | - | - |
