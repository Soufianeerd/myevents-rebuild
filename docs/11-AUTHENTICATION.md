# Authentication Architecture

MyEvent's implements a secure, local-first authentication system that adheres to strict OWASP recommendations and NIST guidelines.

## Principles

1. **Core Purity**: The core domain (`src/core/auth`) is fully decoupled from Node.js APIs (`node:crypto`), environment variables (`process.env`), and Next.js APIs.
2. **Atomic Operations**: Password reset tokens are consumed in a single atomic transaction.
3. **Timing Protection**: Constant-time dummy hashes are performed on login failures to prevent user enumeration.
4. **Strong Cryptography**: Scrypt is used for password hashing (`N=2^16`, `r=8`, `p=2`). The theoretical work factor memory is ≈ 64 MiB. The `maxmem` is explicitly configured to `268435456` (256 MiB) as a ceiling, not the nominal consumption.

## Domain Model

- **User**: The internal entity representing an authenticated user.
- **SafeUser**: A projection of the user containing only safe-to-expose data (`id`, `firstName`, `lastName`, `displayName`, `email`).
- **Session**: A logical session tracked in the persistence layer, associated with a single user and an expiration date.

## Authentication Flow

1. **Registration**: Validates the email and password, creates the user, generates a session, and issues an HTTP-only secure cookie.
2. **Login**: Verifies credentials securely, creates a new session, and sets the cookie. Dummy hashing prevents enumeration.
3. **Reset Password**: Generates an atomic reset token, emails a link, and performs atomic consumption during the reset.

## Infrastructure & Providers

- `TokenHasher`: Uses `crypto.createHash('sha256')` to hash session tokens.
- `SecretTokenProvider`: Generates high-entropy random tokens using `crypto.randomBytes`.
- `AppUrlProvider`: Injects the application base URL for generating links in emails.
- `LocalJsonStore`: Uses in-process per-file serialization + atomic rename to perform safe Read-Modify-Write (RMW) operations. It does not provide an OS-level or inter-process lock.

## Production Blockers

The following security features are intentionally omitted in the current local-first architecture, but MUST be implemented before any production release:

- **TLS everywhere**: Enforce HTTPS for all traffic.
- **Secure cookie**: The `myevents_session` cookie must include the `Secure` flag in production.
- **Login throttling**: Distributed brute-force protection and rate limiting on the login endpoint.
- **Password reset throttling**: Rate limiting on password reset requests to prevent email enumeration and spam.
- **Monitoring/Audit**: Centralized security logging and anomaly detection.
- **Future production Auth adapter**: Replace local JSON stores with a robust database (e.g., PostgreSQL).
- **MFA / Passkeys decision**: Evaluate multi-factor authentication requirements.
