'use server';
import {
  beginDesignImage,
  finishUpload,
  designImages,
} from '@/server/media/service';
export async function beginImageAction(id: string, input: unknown) {
  try {
    return { ok: true as const, data: await beginDesignImage(id, input) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Import impossible.',
    };
  }
}
export async function finishImageAction(
  eventId: string,
  id: string,
  secret: string,
) {
  try {
    await finishUpload(id, secret);
    const asset = (await designImages(eventId)).find((m) => m.id === id);
    if (!asset) throw new Error('Image indisponible.');
    return { ok: true as const, asset };
  } catch {
    return {
      ok: false as const,
      error:
        'La photo n’a pas pu être validée. Vérifiez son format puis réessayez.',
    };
  }
}
