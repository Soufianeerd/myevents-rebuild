import {
  UserRepository,
  SessionRepository,
  PasswordResetRepository,
} from '../../../providers/contracts/auth/AuthRepositories';
import { PasswordHasher } from '../../../providers/contracts/auth/PasswordHasher';
import { TokenHasher } from '../../../providers/contracts/auth/TokenHasher';
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
    private tokenHasher: TokenHasher,
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

    const tokenHash = this.tokenHasher.hashToken(command.rawResetToken);
    const now = this.clock.now().toISOString();

    // 1-3. Find token, check if used, check expiry, and consume it atomically
    const consumeResult = await this.passwordResetRepository.consumeValidToken(
      tokenHash,
      now,
    );
    if (!consumeResult.ok) {
      // Return generic error for any token issue
      return err(genericError);
    }
    const token = consumeResult.value;

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

    // 7. Token was already marked as used atomically in step 1-3

    // 8. Revoke all existing sessions for the user to force re-login
    await this.sessionRepository.revokeAllUserSessions(user.id);

    return ok(undefined);
  }
}
