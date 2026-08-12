# Authentication Architecture

MyEvent's implements a secure, local-first authentication system that adheres to strict OWASP recommendations and NIST guidelines.

## Principles

1. **Core Purity**: The core domain (`src/core/auth`) is fully decoupled from Node.js APIs (`node:crypto`), environment variables (`process.env`), and Next.js APIs.
2. **Atomic Operations**: Password reset tokens are consumed in a single atomic transaction.
3. **Timing Protection**: Constant-time dummy hashes are performed on login failures to prevent user enumeration.
4. **Strong Cryptography**: Scrypt is used for password hashing (`N=2^16`, `r=8`, `p=2`) with a memory limit of `67,108,864` bytes.

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
- `LocalJsonStore`: Uses file-system level locks and `.tmp` files to perform atomic RMW (Read-Modify-Write) operations.
