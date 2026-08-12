# Session 04 - Authentication

## Goal

Implement a robust, secure, and purely hexagonal authentication system for MyEvent's.

## Work Completed

### 1. Core Architecture Purity

- **Problem**: Previously, Use Cases depended directly on `node:crypto`, `process.env`, and `Date.now()`.
- **Solution**: Created `TokenHasher`, `SecretTokenProvider`, `AppUrlProvider`, and `Clock` ports. Injected Node.js implementations from `src/providers/local`. Added `test:architecture` to block direct access.

### 2. User Model & Signup

- **Problem**: `displayName` was used in signup and the schema.
- **Solution**: Split into `firstName` and `lastName`. Computed `displayName` dynamically in UI projections (`getCurrentSafeUser`) and updated the schemas. Added `passwordConfirmation` to signup.

### 3. Password Policy & Scrypt

- **Problem**: Minimum length was 8, maximum 256. Scrypt was using weaker params.
- **Solution**: Updated policy to 15-128 chars. Configured Scrypt with `N=2^16, r=8, p=2` (OWASP).

### 4. Login Timing Enumeration

- **Problem**: Fast responses for non-existent users allowed enumeration.
- **Solution**: Added a dummy hash mechanism in `loginUser.ts` when the user is not found.

### 5. Reset Token Atomicity

- **Problem**: `findByToken` + `update` led to race conditions.
- **Solution**: Implemented `consumeValidToken(tokenHash, now)` in `LocalPasswordResetRepository` to atomically read, check expiration, and update `usedAt`.

### 6. Local Data Isolation

- **Problem**: Playwright tests ran concurrently using the same `.data` directory.
- **Solution**: Modified `createContainer` and Next.js start script to use `LOCAL_DATA_DIR=.data-e2e`.

### 7. Auth UI Accessibility

- **Problem**: Forms lacked proper A11y tests, missing layout structure.
- **Solution**: Refactored `AuthLayout` to a split screen (600px dark sidebar, ivory form pane). Integrated `@axe-core/playwright` in `auth.test.ts`.

### 8. Testing

- Created full E2E flow testing for registration, login, logout, password reset, error scenarios.
- Implemented unit tests for use cases (`RegisterUserUseCase`, `LoginUserUseCase`).
- Implemented integration tests for local repositories.
