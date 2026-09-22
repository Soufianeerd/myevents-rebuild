'use client';
import { useState } from 'react';
import type { MediaSpace } from '@/core/media/models';
import { configureAction, moderateAction } from './actions';
export function SpaceControls({
  eventId,
  space,
}: {
  eventId: string;
  space: MediaSpace;
}) {
  const [value, setValue] = useState(space);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    const result = await configureAction(eventId, space.kind, {
      enabled: value.enabled,
      collaborative: value.collaborative,
      availableAt: value.availableAt,
      allowDownload: value.allowDownload,
    });
    setMessage(result.ok ? 'Réglages enregistrés.' : result.error);
    setBusy(false);
  }
  return (
    <div>
      {(['enabled', 'collaborative', 'allowDownload'] as const).map(
        (key, index) => (
          <p key={key}>
            <label>
              <input
                type="checkbox"
                checked={value[key]}
                onChange={(e) =>
                  setValue({ ...value, [key]: e.target.checked })
                }
              />
              {
                [
                  'Accepter les dépôts',
                  'Ouvrir la galerie aux invités',
                  'Autoriser les téléchargements',
                ][index]
              }
            </label>
          </p>
        ),
      )}
      <label>
        Ouverture de la galerie
        <input
          type="datetime-local"
          value={new Date(
            new Date(value.availableAt).getTime() -
              new Date(value.availableAt).getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16)}
          onChange={(e) => {
            if (e.target.value)
              setValue({
                ...value,
                availableAt: new Date(e.target.value).toISOString(),
              });
          }}
        />
      </label>
      <p>
        <button disabled={busy} onClick={() => void save()}>
          Enregistrer les réglages
        </button>
      </p>
      <p role="status">{message}</p>
    </div>
  );
}
export function MediaControls({
  eventId,
  item,
}: {
  eventId: string;
  item: { id: string; name: string; hidden: boolean; favorite: boolean };
}) {
  const [name, setName] = useState(item.name);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function update(patch: unknown) {
    setBusy(true);
    const result = await moderateAction(eventId, item.id, patch);
    setMessage(result.ok ? 'Modification enregistrée.' : result.error);
    setBusy(false);
  }
  return (
    <div>
      <label>
        Nom
        <input
          value={name}
          maxLength={180}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <p>
        <button
          disabled={busy || !name.trim()}
          onClick={() => void update({ name })}
        >
          Renommer
        </button>
      </p>
      <p>
        <button
          disabled={busy}
          onClick={() => void update({ favorite: !item.favorite })}
        >
          {item.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        </button>
      </p>
      <p>
        <button
          disabled={busy}
          onClick={() => void update({ hidden: !item.hidden })}
        >
          {item.hidden ? 'Montrer aux invités' : 'Masquer aux invités'}
        </button>
      </p>
      <button
        disabled={busy}
        onClick={() => {
          if (window.confirm('Supprimer définitivement ce souvenir ?'))
            void update({ status: 'deleted' });
        }}
      >
        Supprimer
      </button>
      <p role="status">{message}</p>
    </div>
  );
}
