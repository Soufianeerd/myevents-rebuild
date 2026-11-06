'use client';
import { useState } from 'react';
import type { Guest } from '@/core/guests/models';
import { nonResponders, type ReceivedResponse } from '@/core/guests/responses';
import { prepareRemindersAction } from './actions';
import styles from '../workspace.module.css';
export function ReminderPanel({
  eventId,
  guests,
  responses,
}: {
  eventId: string;
  guests: Guest[];
  responses: ReceivedResponse[];
}) {
  const candidates = nonResponders(guests, responses);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const [reminders, setReminders] = useState<
    Array<{
      guestId: string;
      name: string;
      email: string;
      message: string;
      url: string;
    }>
  >([]);
  const pending = candidates.filter(
    (guest) => !reminders.some((reminder) => reminder.guestId === guest.id),
  );
  const visible = reminders.filter((reminder) =>
    candidates.some((guest) => guest.id === reminder.guestId),
  );
  return (
    <section className={styles.card}>
      <h3>Relancer les invités sans réponse</h3>
      <p>
        {candidates.length} invités à relancer. Les réponses positives, les
        refus et les contacts pas encore invités sont exclus.
      </p>
      <button
        disabled={busy || pending.length === 0}
        onClick={async () => {
          setBusy(true);
          setMessage('');
          try {
            const result = await prepareRemindersAction(
              eventId,
              pending.slice(0, 100).map((guest) => guest.id),
            );
            if (!result.ok) throw new Error(result.error);
            setReminders((items) => [...items, ...result.reminders]);
            setMessage(
              'Messages prêts à partager. Aucun message n’a été envoyé automatiquement.',
            );
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : 'Préparation impossible.',
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy
          ? 'Préparation…'
          : `Préparer ${Math.min(pending.length, 100)} relances`}
      </button>
      <p role="status" aria-label="État des relances">
        {message}
      </p>
      {!!visible.length && (
        <details open>
          <summary>Messages personnalisés ({visible.length})</summary>
          <ul>
            {visible.map((reminder) => (
              <li key={reminder.guestId}>
                <strong>{reminder.name}</strong>
                <p>{reminder.message}</p>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(reminder.message);
                      setMessage(`Relance de ${reminder.name} copiée.`);
                    } catch {
                      setMessage('Sélectionnez le message pour le copier.');
                    }
                  }}
                >
                  Copier la relance de {reminder.name}
                </button>
                {reminder.email && (
                  <p>
                    <a
                      href={`mailto:${encodeURIComponent(reminder.email)}?subject=${encodeURIComponent('Votre réponse à notre invitation')}&body=${encodeURIComponent(reminder.message)}`}
                    >
                      Préparer l’e-mail pour {reminder.name}
                    </a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
