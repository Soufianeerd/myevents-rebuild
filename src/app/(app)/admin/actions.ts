'use server';
import { revalidatePath } from 'next/cache';
import { setPrintStage } from '@/server/admin/service';
export async function setStageAction(
  _state: { error: string; ok: boolean },
  form: FormData,
) {
  try {
    await setPrintStage({
      requestId: form.get('requestId'),
      stage: form.get('stage'),
      note: form.get('note') ?? '',
    });
    revalidatePath('/admin');
    return { error: '', ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Mise à jour impossible.',
      ok: false,
    };
  }
}
