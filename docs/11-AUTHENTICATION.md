# Authentication Architecture

MyEvent's implements a secure, local-first authentication system that adheres to strict OWASP recommendations and NIST guidelines.

## Principles

1. **Core Purity**: The core domain (`src/core/auth`) is fully decoupled from Node.js APIs (`node:crypto`), environment variables (`process.env`), and Next.js APIs.
2. **Atomic Operations**: Password reset tokens are consumed in a single atomic transaction.
3. **Timing Protection**: Constant-time dummy hashes are performed on login failures to prevent user enumeration.
4. **Strong Cryptography**: Scrypt is used for password hashing (`N=2^16`, `r=8`, `p=2`). The theoretical work factor memory is `≈ 64 MiB`. The `maxmem` is explicitly configured to `268435456` bytes (256 MiB) as a ceiling to allow execution without failing, it is not the nominal consumption.

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
- `LocalJsonStore`: Uses an in-process per-file serialized queue combined with atomic temporary-file + rename writes. It does not provide an OS-level or inter-process lock.

## Production Blockers

The following items must be resolved before this authentication system can be deployed to a production environment:

- **TLS everywhere**: Enforce HTTPS for all requests.
- **Secure cookie**: The `myevents_session` cookie must be set with `Secure: true`.
- **Login throttling / brute-force protection**: Implement distributed rate limiting for login attempts.
- **Password-reset throttling**: Implement rate limiting for password reset requests to prevent email bombing.
- **Monitoring/audit**: Implement proper security logging and monitoring.
- **Future production Auth adapter**: Replace local JSON persistence with a production database adapter.
- **MFA/passkeys decision**: Evaluate and implement multi-factor authentication or passkeys if required.
