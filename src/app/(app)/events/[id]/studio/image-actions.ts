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
export async function beginMusicAction(id: string, input: unknown) {
  try {
    const { beginDesignAudio } = await import('@/server/media/service');
    return { ok: true as const, data: await beginDesignAudio(id, input) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Import impossible.',
    };
  }
}
export async function finishMusicAction(
  eventId: string,
  id: string,
  secret: string,
) {
  try {
    await finishUpload(id, secret);
    const { designMusic } = await import('@/server/media/service');
    const asset = (await designMusic(eventId)).find((item) => item.id === id);
    if (!asset) throw new Error();
    return { ok: true as const, asset };
  } catch {
    return {
      ok: false as const,
      error: 'La musique n’a pas pu être validée. Vérifiez son format.',
    };
  }
}
