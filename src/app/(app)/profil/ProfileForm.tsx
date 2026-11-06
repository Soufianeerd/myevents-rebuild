'use client';
import { useState } from 'react';
import type { SafeUser } from '@/core/auth';
import { updateProfileAction } from './actions';
export function ProfileForm({ user }: { user: SafeUser }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setBusy(true);
        setMessage('');
        try {
          const result = await updateProfileAction({
            firstName: data.get('firstName'),
            lastName: data.get('lastName'),
          });
          setMessage(result.ok ? 'Profil enregistré.' : result.error);
        } catch {
          setMessage('Connexion interrompue. Réessayez.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy} style={{ padding: 0, border: 0 }}>
        <label>
          Prénom
          <input
            name="firstName"
            defaultValue={user.firstName}
            autoComplete="given-name"
            required
            maxLength={100}
          />
        </label>
        <label>
          Nom
          <input
            name="lastName"
            defaultValue={user.lastName}
            autoComplete="family-name"
            required
            maxLength={100}
          />
        </label>
        <label>
          Adresse e-mail
          <input value={user.email} readOnly type="email" />
        </label>
        <button type="submit">
          {busy ? 'Enregistrement…' : 'Enregistrer mon profil'}
        </button>
      </fieldset>
      <p role="status">{message}</p>
    </form>
  );
}
