import * as crypto from 'node:crypto';
import {
  UserRepository,
  SessionRepository,
  PasswordResetRepository,
} from '../../../providers/contracts/auth/AuthRepositories';
import { PasswordHasher } from '../../../providers/contracts/auth/PasswordHasher';
import { Clock } from '../../../providers/contracts/Clock';
import { validatePasswordPolicy } from '../utils/PasswordPolicy';
import { Result, ok, err } from '../../result';
import { AppError, createAppError } from '../../errors';

export interface ResetPasswordCommand {
  rawResetToken: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private passwordResetRepository: PasswordResetRepository,
    private passwordHasher: PasswordHasher,
    private clock: Clock,
  ) {}

  async execute(
    command: ResetPasswordCommand,
  ): Promise<Result<void, AppError>> {
    const genericError = createAppError(
      'VALIDATION_ERROR',
      'Ce lien de réinitialisation est invalide ou a expiré.',
      400,
    );

    const tokenHash = crypto
      .createHash('sha256')
      .update(command.rawResetToken)
      .digest('base64');

    // 1. Find token
    const token = await this.passwordResetRepository.findByTokenHash(tokenHash);
    if (!token) {
      return err(genericError);
    }

    // 2. Check if used
    if (token.usedAt) {
      return err(genericError);
    }

    // 3. Check expiry
    const now = this.clock.now().toISOString();
    if (token.expiresAt < now) {
      return err(genericError);
    }

    // 4. Validate new password
    const pwdResult = validatePasswordPolicy(command.newPassword);
    if (!pwdResult.ok) {
      return err(pwdResult.error);
    }

    // 5. Get user
    const user = await this.userRepository.findById(token.userId);
    if (!user) {
      return err(genericError);
    }

    // 6. Hash new password
    const hashInfo = await this.passwordHasher.hash(command.newPassword);

    user.passwordHash = hashInfo.hash;
    user.passwordSalt = hashInfo.salt;
    user.passwordAlgorithm = hashInfo.algorithm;
    user.passwordParams = hashInfo.params;
    user.passwordUpdatedAt = now;
    user.updatedAt = now;

    const updateResult = await this.userRepository.update(user);
    if (!updateResult.ok) {
      return err(updateResult.error);
    }

    // 7. Mark token as used
    await this.passwordResetRepository.markAsUsed(token.id, now);

    // 8. Revoke all existing sessions for the user to force re-login
    await this.sessionRepository.revokeAllUserSessions(user.id);

    return ok(undefined);
  }
}
