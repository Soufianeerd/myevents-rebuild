'use server';
import { updateProfile } from '@/server/profile/service';
import { revalidatePath } from 'next/cache';
export async function updateProfileAction(input: unknown) {
  try {
    await updateProfile(input);
    revalidatePath('/', 'layout');
    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      error: 'Vérifiez votre prénom et votre nom, puis réessayez.',
    };
  }
}
