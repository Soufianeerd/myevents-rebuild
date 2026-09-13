import type { AuthenticationProvider } from '@/providers/contracts/auth/AuthenticationProvider';
import { createContainer } from '@/server/container';
import {
  getSessionCookie,
  setSessionCookie,
  clearSessionCookie,
} from './session';
import {
  LoginUserUseCase,
  RegisterUserUseCase,
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
  LogoutSessionUseCase,
} from '@/core/auth';
import { ok, err } from '@/core/result';
import { createAppError } from '@/core/errors';
import { allowAuthAttempt, AUTH_LIMIT_MESSAGE } from './attempts';

export class LocalAuthenticationProvider implements AuthenticationProvider {
  async currentIdentity() {
    const raw = await getSessionCookie();
    if (!raw) return null;
    const c = createContainer();
    const session = await c.sessionRepository.findByTokenHash(
      c.tokenHasher.hashToken(raw),
    );
    if (!session) return null;
    if (session.expiresAt <= c.clock.now().toISOString()) {
      await c.sessionRepository.revoke(session.id);
      return null;
    }
    const user = await c.userRepository.findById(session.userId);
    if (!user) return null;
    return {
      tenantId: user.tenantId,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
      },
    };
  }
  async login(email: string, password: string) {
    if (!(await allowAuthAttempt('login', email)))
      return err(createAppError('UNAUTHORIZED', AUTH_LIMIT_MESSAGE));
    const c = createContainer();
    const result = await new LoginUserUseCase(
      c.userRepository,
      c.sessionRepository,
      c.passwordHasher,
      c.tokenHasher,
      c.secretTokenProvider,
      c.idGenerator,
      c.clock,
    ).execute({ email, password });
    if (!result.ok) return err(result.error);
    await setSessionCookie(
      result.value.rawSessionToken,
      new Date(result.value.session.expiresAt),
    );
    return ok(undefined);
  }
  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    if (!(await allowAuthAttempt('register', input.email)))
      return err(createAppError('UNAUTHORIZED', AUTH_LIMIT_MESSAGE));
    const c = createContainer();
    const result = await new RegisterUserUseCase(
      c.userRepository,
      c.sessionRepository,
      c.passwordHasher,
      c.tokenHasher,
      c.secretTokenProvider,
      c.idGenerator,
      c.clock,
    ).execute({ ...input, passwordConfirmation: input.password });
    if (!result.ok) return err(result.error);
    await setSessionCookie(
      result.value.rawSessionToken,
      new Date(result.value.session.expiresAt),
    );
    return ok({ confirmationRequired: false });
  }
  async logout() {
    const raw = await getSessionCookie();
    if (raw) {
      const c = createContainer();
      await new LogoutSessionUseCase(
        c.sessionRepository,
        c.tokenHasher,
      ).execute(raw);
    }
    await clearSessionCookie();
  }
  async requestReset(email: string) {
    if (!(await allowAuthAttempt('forgot', email))) return;
    const c = createContainer();
    await new RequestPasswordResetUseCase(
      c.userRepository,
      c.passwordResetRepository,
      c.mailProvider,
      c.tokenHasher,
      c.secretTokenProvider,
      c.appUrlProvider,
      c.idGenerator,
      c.clock,
    ).execute({ email });
  }
  async reset(token: string, password: string) {
    if (!(await allowAuthAttempt('reset', token)))
      return err(createAppError('UNAUTHORIZED', AUTH_LIMIT_MESSAGE));
    const c = createContainer();
    return new ResetPasswordUseCase(
      c.userRepository,
      c.sessionRepository,
      c.passwordResetRepository,
      c.passwordHasher,
      c.tokenHasher,
      c.clock,
    ).execute({ rawResetToken: token, newPassword: password });
  }
}
