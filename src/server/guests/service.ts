import { withHouseholds, nonResponders } from '@/core/guests/responses';
import { z } from 'zod';
import { env } from '@/lib/env';
import { eventScope } from '@/server/experience/service';
import { guestBookSchema } from '@/core/guests/models';
import { reconcileResponse } from '@/core/guests/reconciliation';
import { randomUUID } from 'node:crypto';
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
    document: withHouseholds(
      record?.document ?? guestBookSchema.parse({}),
      responses,
    ),
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

export async function prepareReminders(id: string, selected: unknown) {
  const ids = z.array(z.uuid()).min(1).max(100).parse(selected);
  const state = await guestState(id);
  const eligible = nonResponders(state.document.guests, state.responses);
  if (ids.some((guestId) => !eligible.some((guest) => guest.id === guestId)))
    throw new Error(
      'La liste a changé : rechargez les invités avant de préparer les relances.',
    );
  const { guestInvitationLink } = await import('@/server/experience/service');
  const result = [];
  for (const guest of eligible.filter((guest) => ids.includes(guest.id))) {
    const url = await guestInvitationLink(id, guest.id);
    result.push({
      guestId: guest.id,
      name: guest.name,
      email: guest.email,
      message: `Bonjour ${guest.name}, nous attendons votre réponse pour ${state.event.name}. Vous pouvez nous indiquer votre présence ici : ${url}`,
      url,
    });
  }
  return result;
}

export async function attachResponse(
  id: string,
  input: unknown,
  revision: unknown,
) {
  const selection = z
    .object({ responseId: z.uuid(), guestId: z.uuid().nullable() })
    .parse(input);
  const state = await guestState(id);
  const expected = z.number().int().min(0).parse(revision);
  if (state.revision !== expected)
    throw new Error(
      'La liste d’invités a été modifiée ailleurs. Rechargez la page.',
    );
  const document = reconcileResponse(
    state.document,
    state.responses,
    selection.responseId,
    selection.guestId,
    randomUUID,
  );
  return saveGuests(id, document, expected);
}
