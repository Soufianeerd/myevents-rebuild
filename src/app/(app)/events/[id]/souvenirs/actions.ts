'use server';
import { revalidatePath } from 'next/cache';
import { configureSpace, moderateMedia } from '@/server/media/service';
export async function configureAction(
  id: string,
  kind: string,
  input: unknown,
) {
  try {
    await configureSpace(id, kind, input);
    revalidatePath(`/events/${id}/souvenirs`);
    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      error: 'Impossible de modifier cet espace. Vérifiez votre formule.',
    };
  }
}
export async function moderateAction(
  eventId: string,
  id: string,
  input: unknown,
) {
  try {
    await moderateMedia(eventId, id, input);
    revalidatePath(`/events/${eventId}/souvenirs`);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error &&
        error.message.startsWith('Retirez cette photo')
          ? error.message
          : 'La modification n’a pas pu être enregistrée.',
    };
  }
}

export async function moderateManyAction(
  eventId: string,
  ids: unknown,
  input: unknown,
) {
  const { z } = await import('zod');
  const selected = z.array(z.uuid()).min(1).max(100).parse(ids);
  const patch = z
    .union([
      z.object({ favorite: z.boolean() }).strict(),
      z.object({ hidden: z.boolean() }).strict(),
      z.object({ status: z.literal('deleted') }).strict(),
    ])
    .parse(input);
  const failed: string[] = [];
  for (const id of [...new Set(selected)]) {
    try {
      await moderateMedia(eventId, id, patch);
    } catch {
      failed.push(id);
    }
  }
  revalidatePath(`/events/${eventId}/souvenirs`);
  return { updated: new Set(selected).size - failed.length, failed };
}
