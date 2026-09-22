'use server';
import { revalidatePath } from 'next/cache';
import { activateBusinessPreview } from '@/server/experience/service';
export async function activatePreviewAction(id: string) {
  try {
    await activateBusinessPreview(id);
    revalidatePath(`/events/${id}`, 'layout');
    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      error: 'Impossible d’activer la démonstration pour cet événement.',
    };
  }
}
