'use server';
import { savePlanning } from '@/server/planning/service';
import { revalidatePath } from 'next/cache';
export async function savePlanningAction(
  id: string,
  input: unknown,
  revision: number,
) {
  try {
    const record = await savePlanning(id, input, revision);
    revalidatePath(`/events/${id}`);
    return { ok: true as const, record };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : 'Enregistrement impossible.',
    };
  }
}
