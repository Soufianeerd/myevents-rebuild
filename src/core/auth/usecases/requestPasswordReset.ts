import {
  UserRepository,
  PasswordResetRepository,
} from '../../../providers/contracts/auth/AuthRepositories';
import { MailProvider } from '../../../providers/contracts/auth/MailProvider';
import { TokenHasher } from '../../../providers/contracts/auth/TokenHasher';
import { SecretTokenProvider } from '../../../providers/contracts/auth/SecretTokenProvider';
import { AppUrlProvider } from '../../../providers/contracts/auth/AppUrlProvider';
import { IdGenerator } from '../../../providers/contracts/IdGenerator';
import { Clock } from '../../../providers/contracts/Clock';
import { PasswordResetToken } from '../models';
import { normalizeEmail } from '../utils/normalizeEmail';
import { Result, ok, err } from '../../result';
import { AppError } from '../../errors';
import { PasswordResetTokenId } from '../models';

export interface RequestPasswordResetCommand {
  email: string;
}

export class RequestPasswordResetUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordResetRepository: PasswordResetRepository,
    private mailProvider: MailProvider,
    private tokenHasher: TokenHasher,
    private secretTokenProvider: SecretTokenProvider,
    private appUrlProvider: AppUrlProvider,
    private idGenerator: IdGenerator,
    private clock: Clock,
  ) {}

  async execute(
    command: RequestPasswordResetCommand,
  ): Promise<Result<void, AppError>> {
    const emailResult = normalizeEmail(command.email);
    if (!emailResult.ok) {
      // Fail silently to prevent email enumeration
      return ok(undefined);
    }

    const user = await this.userRepository.findByEmail(emailResult.value);
    if (!user) {
      // Fail silently to prevent email enumeration
      return ok(undefined);
    }

    // Generate reset token
    const rawResetToken = this.secretTokenProvider.generateToken();
    const tokenHash = this.tokenHasher.hashToken(rawResetToken);

    const now = this.clock.now().toISOString();
    // 30 minutes expiration
    const thirtyMinsMs = 30 * 60 * 1000;
    const expiresAt = new Date(
      this.clock.now().getTime() + thirtyMinsMs,
    ).toISOString();

    const token: PasswordResetToken = {
      id: this.idGenerator.generate() as PasswordResetTokenId,
      userId: user.id,
      tokenHash,
      createdAt: now,
      expiresAt,
    };

    const createResult = await this.passwordResetRepository.create(token);
    if (!createResult.ok) return err(createResult.error);

    // Provide the reset link that points to our local app
    const baseUrl = this.appUrlProvider.getAppUrl() || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reinitialiser-mot-de-passe?token=${rawResetToken}`;

    await this.mailProvider.sendPasswordResetEmail(user.email, resetLink);

    return ok(undefined);
  }
}
