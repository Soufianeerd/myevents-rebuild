import { profileNamesSchema } from '@/core/profile/models';
import { env } from '@/lib/env';
import { getCurrentAccessContext } from '@/server/auth/getCurrentAccessContext';
export async function updateProfile(input: unknown) {
  const names = profileNamesSchema.parse(input);
  const context = await getCurrentAccessContext();
  if (context.kind !== 'user')
    throw new Error('Connectez-vous pour modifier votre profil.');
  if (env.APP_MODE === 'local') {
    const { createContainer } = await import('@/server/container');
    const { LocalProfileRepository } =
      await import('@/providers/local/LocalProfileRepository');
    return new LocalProfileRepository(
      createContainer().userRepository,
    ).updateNames(context.userId, context.tenantId, names);
  }
  if (env.CONNECTED_PROVIDER !== 'neon')
    throw new Error('Provider profil indisponible.');
  const { NeonProfileRepository } =
    await import('@/providers/neon/NeonProfileRepository');
  const { authenticatedNeonDatabase } = await import('@/server/neon/auth');
  return new NeonProfileRepository(
    await authenticatedNeonDatabase(),
  ).updateNames(context.userId, context.tenantId, names);
}
