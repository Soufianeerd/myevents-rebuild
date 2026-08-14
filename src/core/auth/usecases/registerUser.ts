import {
  UserRepository,
  SessionRepository,
} from '../../../providers/contracts/auth/AuthRepositories';
import { PasswordHasher } from '../../../providers/contracts/auth/PasswordHasher';
import { TokenHasher } from '../../../providers/contracts/auth/TokenHasher';
import { SecretTokenProvider } from '../../../providers/contracts/auth/SecretTokenProvider';
import { IdGenerator } from '../../../providers/contracts/IdGenerator';
import { Clock } from '../../../providers/contracts/Clock';
import { User, Session, SafeUser } from '../models';
import { normalizeEmail } from '../utils/normalizeEmail';
import { validatePasswordPolicy } from '../utils/PasswordPolicy';
import { Result, ok, err } from '../../result';
import { AppError, createAppError } from '../../errors';
import { UserId, TenantId } from '../../ids';
import { SessionId } from '../models';

export interface RegisterUserCommand {
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName: string;
  lastName: string;
}

export interface RegisterUserResult {
  user: SafeUser;
  session: Session;
  rawSessionToken: string;
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private passwordHasher: PasswordHasher,
    private tokenHasher: TokenHasher,
    private secretTokenProvider: SecretTokenProvider,
    private idGenerator: IdGenerator,
    private clock: Clock,
  ) {}

  async execute(
    command: RegisterUserCommand,
  ): Promise<Result<RegisterUserResult, AppError>> {
    // 1. Validate inputs
    const emailResult = normalizeEmail(command.email);
    if (!emailResult.ok) return err(emailResult.error);
    const normalizedEmail = emailResult.value;

    const pwdResult = validatePasswordPolicy(command.password);
    if (!pwdResult.ok) return err(pwdResult.error);

    if (command.password !== command.passwordConfirmation) {
      return err(
        createAppError(
          'VALIDATION_ERROR',
          'Les mots de passe ne correspondent pas.',
        ),
      );
    }

    if (!command.firstName.trim() || !command.lastName.trim()) {
      return err(
        createAppError('VALIDATION_ERROR', 'Le prénom et le nom sont requis.'),
      );
    }

    // 2. Check for duplicate email
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      return err(
        createAppError(
          'CONFLICT',
          'Cette adresse e-mail est déjà utilisée.',
          409,
        ),
      );
    }

    // 3. Hash password
    const hashInfo = await this.passwordHasher.hash(command.password);

    // 4. Generate IDs
    const userId = this.idGenerator.generate() as UserId;
    const tenantId = this.idGenerator.generate() as TenantId;
    const now = this.clock.now().toISOString();
    const firstName = command.firstName.trim();
    const lastName = command.lastName.trim();

    // 5. Create User
    const user: User = {
      id: userId,
      tenantId,
      email: normalizedEmail,
      firstName,
      lastName,
      passwordHash: hashInfo.hash,
      passwordSalt: hashInfo.salt,
      passwordAlgorithm: hashInfo.algorithm,
      passwordParams: hashInfo.params,
      passwordUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const userCreateResult = await this.userRepository.create(user);
    if (!userCreateResult.ok) return err(userCreateResult.error);

    // 6. Create Session
    const rawSessionToken = this.secretTokenProvider.generateToken();
    const tokenHash = this.tokenHasher.hashToken(rawSessionToken);

    // 30 days expiration
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    // @authorized: new Date() is only used to compute an expiration date from the injected clock.
    const expiresAt = new Date(
      this.clock.now().getTime() + thirtyDaysMs,
    ).toISOString();

    const session: Session = {
      id: this.idGenerator.generate() as SessionId,
      userId,
      tokenHash,
      createdAt: now,
      expiresAt,
    };

    const sessionResult = await this.sessionRepository.create(session);
    if (!sessionResult.ok) {
      // User was created but session failed.
      // We return the session failure, the user can login later.
      return err(sessionResult.error);
    }

    const safeUser: SafeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
    };

    return ok({ user: safeUser, session, rawSessionToken });
  }
}
