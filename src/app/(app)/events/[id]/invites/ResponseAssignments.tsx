'use client';
import { useState } from 'react';
import type { GuestBook } from '@/core/guests/models';
import type { RsvpResponse } from '@/core/invitations/models';
import { replyFor } from '@/core/guests/responses';
import styles from '../workspace.module.css';

export function ResponseAssignments({
  book,
  responses,
  busy,
  onAttach,
}: {
  book: GuestBook;
  responses: Array<RsvpResponse & { createdAt: string }>;
  busy: boolean;
  onAttach: (responseId: string, guestId: string | null) => Promise<void>;
}) {
  const [selection, setSelection] = useState('');
  const [contact, setContact] = useState('');
  const pending = responses.filter(
    (response) =>
      !response.guestId &&
      !book.guests.some((guest) => guest.responseId === response.id),
  );
  const eligible = book.guests.filter((guest) => !replyFor(guest, responses));
  const responseId = pending.some((response) => response.id === selection)
    ? selection
    : pending[0]?.id;
  const guestId = eligible.some((guest) => guest.id === contact) ? contact : '';
  if (!pending.length) return null;
  return (
    <section className={styles.card} aria-label="Rattacher les réponses">
      <h3>Réponses à rattacher · {pending.length}</h3>
      <p>
        Ces réponses proviennent du lien général. Ajoutez leur auteur au carnet
        ou choisissez son contact existant pour retrouver son foyer et son RSVP.
        Vérifiez son identité avant de le rattacher.
      </p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (responseId) await onAttach(responseId, guestId || null);
        }}
      >
        <fieldset disabled={busy}>
          <legend>Correspondance avec le carnet d’invités</legend>
          <div className={styles.grid}>
            <label>
              Réponse à rattacher
              <select
                value={responseId ?? ''}
                onChange={(event) => setSelection(event.target.value)}
              >
                {pending.map((response) => (
                  <option key={response.id} value={response.id}>
                    {response.name} · {response.email} ·{' '}
                    {response.presence === 'yes' ? 'Présent' : 'Absent'} ·{' '}
                    {new Date(response.createdAt).toLocaleString('fr-FR')}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Contact destinataire
              <select
                value={guestId}
                onChange={(event) => setContact(event.target.value)}
              >
                <option value="">Créer un contact depuis cette réponse</option>
                {eligible.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name}
                    {guest.email ? ` · ${guest.email}` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit">Rattacher la réponse</button>
        </fieldset>
      </form>
    </section>
  );
}
