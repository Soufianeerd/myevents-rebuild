import { createContainer } from '../container';
import { getSessionCookie } from './session';
import {
  AccessContext,
  createAnonymousContext,
  createUserContext,
} from '../../core/access';

export async function getCurrentAccessContext(): Promise<AccessContext> {
  const rawSessionToken = await getSessionCookie();

  if (!rawSessionToken) {
    return createAnonymousContext();
  }

  const { sessionRepository, userRepository, clock, tokenHasher } =
    createContainer();

  const tokenHash = tokenHasher.hashToken(rawSessionToken);

  const session = await sessionRepository.findByTokenHash(tokenHash);
  if (!session) {
    return createAnonymousContext();
  }

  const now = clock.now().toISOString();
  if (session.expiresAt < now) {
    await sessionRepository.revoke(session.id);
    return createAnonymousContext();
  }

  const user = await userRepository.findById(session.userId);
  if (!user) {
    await sessionRepository.revoke(session.id);
    return createAnonymousContext();
  }

  // Session is valid, user exists
  return createUserContext(user.id, user.tenantId);
}

// Helper specific to UI fetching SafeUser
export async function getCurrentSafeUser() {
  const context = await getCurrentAccessContext();

  if (context.kind !== 'user') {
    return null;
  }

  const { userRepository } = createContainer();
  const user = await userRepository.findById(context.userId);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
  };
}
