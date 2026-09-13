import { createAnonymousContext, createUserContext } from '@/core/access';
import { createAuthenticationProvider } from './provider';

export async function getCurrentAccessContext() {
  const identity = await (
    await createAuthenticationProvider()
  ).currentIdentity();
  return identity
    ? createUserContext(identity.user.id, identity.tenantId)
    : createAnonymousContext();
}

export async function getCurrentSafeUser() {
  return (
    (await (await createAuthenticationProvider()).currentIdentity())?.user ||
    null
  );
}
