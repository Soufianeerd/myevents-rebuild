'use client';
import { useState } from 'react';
import { activatePreviewAction } from './preview-actions';
export function PreviewAccess({ eventId }: { eventId: string }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  return (
    <section className="my-6 rounded-xl border border-neutral-300 bg-white p-6">
      <h2 className="font-serif text-xl text-primary">
        Essayer le parcours métier
      </h2>
      <p className="my-3 text-sm text-neutral-600">
        Démonstration : invitation, RSVP, souvenirs et cartes, sans carte
        bancaire. Les données de cet événement sont réellement enregistrées.
      </p>
      <button
        disabled={busy}
        className="rounded-lg bg-primary px-5 py-3 text-white disabled:opacity-50"
        onClick={async () => {
          setBusy(true);
          const result = await activatePreviewAction(eventId);
          setMessage(
            result.ok
              ? 'Démonstration activée. Vous pouvez publier votre invitation et utiliser vos espaces souvenirs.'
              : result.error,
          );
          setBusy(false);
        }}
      >
        {busy ? 'Activation…' : 'Activer la démonstration'}
      </button>
      <p role="status" className="mt-3 text-sm">
        {message}
      </p>
    </section>
  );
}
