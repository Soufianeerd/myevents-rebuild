import { SessionRepository } from '../../../providers/contracts/auth/AuthRepositories';
import { TokenHasher } from '../../../providers/contracts/auth/TokenHasher';
import { Result, ok, err } from '../../result';
import { AppError } from '../../errors';

export class LogoutSessionUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private tokenHasher: TokenHasher,
  ) {}

  async execute(rawSessionToken: string): Promise<Result<void, AppError>> {
    const tokenHash = this.tokenHasher.hashToken(rawSessionToken);

    const session = await this.sessionRepository.findByTokenHash(tokenHash);
    if (!session) {
      // Idempotent success
      return ok(undefined);
    }

    const revokeResult = await this.sessionRepository.revoke(session.id);
    if (!revokeResult.ok) {
      return err(revokeResult.error);
    }

    return ok(undefined);
  }
}
