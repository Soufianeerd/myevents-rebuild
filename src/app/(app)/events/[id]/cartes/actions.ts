'use server';
import { saveDesign } from '@/server/designs/service';
export async function saveDesignAction(
  id: string,
  input: unknown,
  revision: number,
) {
  try {
    return { ok: true as const, record: await saveDesign(id, input, revision) };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : 'Enregistrement impossible.',
    };
  }
}

export async function orderPrintAction(id: string, input: unknown) {
  try {
    const { orderPrint } = await import('@/server/designs/service');
    return { ok: true as const, url: await orderPrint(id, input) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Commande indisponible.',
    };
  }
}
