'use server';
import { revalidatePath } from 'next/cache';
import {
  saveInvitation,
  publishInvitation,
  eventScope,
} from '@/server/experience/service';
export async function saveDocumentAction(
  id: string,
  document: unknown,
  revision: number,
) {
  try {
    const record = await saveInvitation(id, document, revision);
    return { ok: true as const, record };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : 'Enregistrement impossible.',
    };
  }
}
export async function publishDocumentAction(id: string, revision: number) {
  try {
    const url = await publishInvitation(id, revision);
    revalidatePath(`/events/${id}`);
    return { ok: true as const, url };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Publication impossible.',
    };
  }
}
export async function suspendDocumentAction(id: string) {
  try {
    const { context, repository } = await eventScope(id);
    await repository.suspend(id, context.tenantId);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: 'Suspension impossible.' };
  }
}
