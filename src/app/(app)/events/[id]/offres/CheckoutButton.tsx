'use client';
import Link from 'next/link';
import { useId, useState } from 'react';
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
    [consent, setConsent] = useState(false),
    [error, setError] = useState('');
  const consentId = useId();
  return (
    <div>
      <p>
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={!enabled}
        />{' '}
        <label htmlFor={consentId}>
          J’accepte les <Link href="/cgv">conditions de vente</Link>, je demande
          l’activation immédiate du service et je reconnais perdre mon droit de
          rétractation une fois le service activé.
        </label>
      </p>
      <button
        disabled={busy || !enabled || !consent}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            const result = await checkoutAction(eventId, offerId, consent);
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
