'use client';
import { useState, useRef, type FormEvent } from 'react';
import type {
  InvitationDocument,
  InvitedGuest,
} from '@/core/invitations/models';
import { rsvpAction } from '@/app/i/[token]/actions';
import styles from './invitation.module.css';
export function RsvpForm({
  document,
  token,
  revision,
  preview = false,
  guest,
}: {
  document: InvitationDocument;
  token?: string;
  revision?: number;
  preview?: boolean;
  guest?: InvitedGuest;
}) {
  const [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  const responseId = useRef<string | null>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (preview || !token || revision === undefined || busy) return;
    setBusy(true);
    setStatus('');
    const data = new FormData(e.currentTarget);
    const answers: Record<string, unknown> = {};
    for (const field of document.fields) {
      const raw = data.get(field.id);
      if (field.type === 'multiple') answers[field.id] = data.getAll(field.id);
      else if (raw !== null && raw !== '')
        answers[field.id] =
          field.type === 'number'
            ? Number(raw)
            : field.type === 'boolean'
              ? raw === 'yes'
              : String(raw);
    }
    responseId.current ??= crypto.randomUUID();
    try {
      const result = await rsvpAction(
        token,
        {
          id: responseId.current,
          name: data.get('guest_name'),
          email: data.get('guest_email'),
          presence: data.get('presence'),
          companions: Number(data.get('guest_companions') ?? 0),
          consent: data.get('consent') === 'on',
          answers,
        },
        revision,
      );
      if (result.ok) {
        setDone(true);
        setStatus('Votre réponse a bien été enregistrée. Merci !');
      } else setStatus(result.error);
    } catch {
      setStatus(
        'Connexion interrompue. Vous pouvez réessayer sans dupliquer votre réponse.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (done)
    return (
      <p role="status" className={styles.success}>
        {status}
      </p>
    );
  return (
    <form onSubmit={submit} className={styles.form}>
      {preview && (
        <p className={styles.notice}>
          Aperçu du formulaire — aucune réponse n’est envoyée depuis le Studio.
        </p>
      )}
      <label>
        Votre nom{' '}
        <input
          name="guest_name"
          required
          maxLength={150}
          autoComplete="name"
          defaultValue={guest?.name}
          readOnly={!!guest}
        />
      </label>
      <label>
        Votre adresse e-mail{' '}
        <input
          defaultValue={guest?.email}
          name="guest_email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </label>
      <fieldset>
        <legend>Serez-vous présent ?</legend>
        <label className={styles.inline}>
          <input type="radio" name="presence" value="yes" required /> Oui, avec
          plaisir
        </label>
        <label className={styles.inline}>
          <input type="radio" name="presence" value="no" required /> Non,
          malheureusement
        </label>
      </fieldset>
      {guest && guest.maxCompanions > 0 && (
        <label>
          Nombre d’accompagnants (maximum {guest.maxCompanions})
          <input
            type="number"
            name="guest_companions"
            min={0}
            max={guest.maxCompanions}
            defaultValue={0}
            required
          />
        </label>
      )}
      {document.fields.map((field) => (
        <div key={field.id}>
          {field.type === 'multiple' ? (
            <fieldset>
              <legend>
                {field.label}
                {field.required ? ' *' : ''}
              </legend>
              {field.options.map((option) => (
                <label className={styles.inline} key={option}>
                  <input type="checkbox" name={field.id} value={option} />
                  {option}
                </label>
              ))}
            </fieldset>
          ) : (
            <label>
              {field.label}
              {field.required ? ' *' : ''}
              {field.type === 'choice' || field.type === 'boolean' ? (
                <select name={field.id} required={field.required}>
                  <option value="">Choisir</option>
                  {(field.type === 'boolean'
                    ? ['yes', 'no']
                    : field.options
                  ).map((option) => (
                    <option key={option} value={option}>
                      {field.type === 'boolean'
                        ? option === 'yes'
                          ? 'Oui'
                          : 'Non'
                        : option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.id}
                  required={field.required}
                  maxLength={4000}
                />
              ) : (
                <input
                  name={field.id}
                  type={field.type === 'text' ? 'text' : field.type}
                  required={field.required}
                  maxLength={4000}
                  step={field.type === 'number' ? 'any' : undefined}
                />
              )}
            </label>
          )}
          {field.description && (
            <p className={styles.help}>{field.description}</p>
          )}
        </div>
      ))}
      <label className={styles.inline}>
        <input name="consent" type="checkbox" required />
        J’accepte de transmettre ces informations à l’organisateur pour cet
        événement.
      </label>
      <button disabled={busy || preview} type="submit">
        {busy ? 'Enregistrement…' : 'Envoyer ma réponse'}
      </button>
      {status && <p role="alert">{status}</p>}
    </form>
  );
}
