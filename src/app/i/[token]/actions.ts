'use server';
import { submitResponse } from '@/server/experience/service';
export async function rsvpAction(
  token: string,
  input: unknown,
  revision: number,
) {
  try {
    await submitResponse(token, input, revision);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : 'Réponse non enregistrée. Réessayez.',
    };
  }
}
