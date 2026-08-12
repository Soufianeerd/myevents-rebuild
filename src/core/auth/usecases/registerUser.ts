import * as crypto from 'node:crypto';
import {
  UserRepository,
  SessionRepository,
} from '../../../providers/contracts/auth/AuthRepositories';
import { PasswordHasher } from '../../../providers/contracts/auth/PasswordHasher';
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
  displayName: string;
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

    if (!command.displayName.trim()) {
      return err(
        createAppError('VALIDATION_ERROR', 'Le nom affiché est requis.'),
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

    // 5. Create User
    const user: User = {
      id: userId,
      tenantId,
      email: normalizedEmail,
      displayName: command.displayName.trim(),
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
    const rawSessionToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawSessionToken)
      .digest('base64');

    // 30 days expiration
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + thirtyDaysMs).toISOString();

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
      displayName: user.displayName,
      email: user.email,
    };

    return ok({ user: safeUser, session, rawSessionToken });
  }
}
