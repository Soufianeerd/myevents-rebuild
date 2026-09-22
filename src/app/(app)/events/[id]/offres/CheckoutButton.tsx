'use client';
import { useState } from 'react';
import { checkoutAction } from './actions';
export function CheckoutButton({
  eventId,
  offerId,
  enabled,
}: {
  eventId: string;
  offerId: string;
  enabled: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <div>
      <button
        disabled={busy || !enabled}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            const result = await checkoutAction(eventId, offerId);
            if (result.ok) window.location.assign(result.url);
            else setError(result.error);
          } catch {
            setError('Connexion interrompue, réessayez.');
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'Ouverture de Stripe…' : 'Payer avec Stripe Test'}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
