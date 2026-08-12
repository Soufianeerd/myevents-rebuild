import * as crypto from 'node:crypto';
import { SessionRepository } from '../../../providers/contracts/auth/AuthRepositories';
import { Result, ok, err } from '../../result';
import { AppError } from '../../errors';

export class LogoutSessionUseCase {
  constructor(private sessionRepository: SessionRepository) {}

  async execute(rawSessionToken: string): Promise<Result<void, AppError>> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawSessionToken)
      .digest('base64');

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
