'use server';
import { createCheckout } from '@/server/payments/stripe';
export async function checkoutAction(
  id: string,
  offer: string,
  waiverAccepted: unknown,
) {
  try {
    if (waiverAccepted !== true)
      throw new Error(
        'Acceptez les conditions de vente et l’activation immédiate pour continuer.',
      );
    return { ok: true as const, url: await createCheckout(id, offer) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Paiement indisponible.',
    };
  }
}
