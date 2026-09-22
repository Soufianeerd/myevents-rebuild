'use server';
import { beginUpload, finishUpload } from '@/server/media/service';
export async function beginUploadAction(token: string, input: unknown) {
  try {
    return { ok: true as const, data: await beginUpload(token, input) };
  } catch {
    return {
      ok: false as const,
      error:
        'Dépôt impossible. Vérifiez le format, la taille du fichier et la disponibilité de cet espace.',
    };
  }
}
export async function finishUploadAction(id: string, secret: string) {
  try {
    await finishUpload(id, secret);
    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      error:
        'Le fichier n’a pas pu être validé. Réessayez avec un fichier photo, vidéo ou audio valide.',
    };
  }
}
