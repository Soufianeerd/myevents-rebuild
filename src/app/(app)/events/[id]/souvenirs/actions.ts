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
  } catch {
    return {
      ok: false as const,
      error: 'La modification n’a pas pu être enregistrée.',
    };
  }
}
