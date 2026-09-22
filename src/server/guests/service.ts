import { z } from 'zod';
import { env } from '@/lib/env';
import { eventScope } from '@/server/experience/service';
import { guestBookSchema } from '@/core/guests/models';
import type { GuestRepository } from '@/providers/contracts/GuestRepository';
async function repository(): Promise<GuestRepository> {
  if (env.APP_MODE === 'local') {
    const { LocalGuestRepository } =
      await import('@/providers/local/LocalGuestRepository');
    return new LocalGuestRepository(env.LOCAL_DATA_DIR);
  }
  if (env.CONNECTED_PROVIDER !== 'neon') throw new Error('Neon requis.');
  const { NeonGuestRepository } =
    await import('@/providers/neon/NeonGuestRepository');
  return new NeonGuestRepository(
    await (await import('@/server/neon/auth')).authenticatedNeonDatabase(),
  );
}
export async function guestState(id: string) {
  const { event, context, repository: experience } = await eventScope(id);
  const [record, responses] = await Promise.all([
    (await repository()).get(id, context.tenantId),
    experience.responses(id, context.tenantId),
  ]);
  return {
    event,
    document: record?.document ?? guestBookSchema.parse({}),
    revision: record?.revision ?? 0,
    responses,
  };
}
export async function saveGuests(
  id: string,
  input: unknown,
  revision: unknown,
) {
  const document = guestBookSchema.parse(input);
  if (JSON.stringify(document).length > 4000000)
    throw new Error('La liste est trop volumineuse.');
  const { context } = await eventScope(id);
  return (await repository()).save(
    id,
    context.tenantId,
    document,
    z.number().int().min(0).parse(revision),
  );
}
