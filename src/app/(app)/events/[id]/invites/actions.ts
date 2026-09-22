'use server';
import { saveGuests } from '@/server/guests/service';
import { revalidatePath } from 'next/cache';
export async function saveGuestsAction(
  id: string,
  input: unknown,
  revision: number,
) {
  try {
    const record = await saveGuests(id, input, revision);
    revalidatePath(`/events/${id}/invites`);
    return { ok: true as const, record };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : 'Enregistrement impossible.',
    };
  }
}
