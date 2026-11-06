'use client';
import { useState } from 'react';
import type { InvitationDocument } from '@/core/invitations/models';
import { parseMusicLink } from '@/core/invitations/music';
import { beginMusicAction, finishMusicAction } from './image-actions';
type Asset = { id: string; name: string; url: string };
export function MusicControls({
  eventId,
  document,
  change,
  assets,
  uploaded,
}: {
  eventId: string;
  document: InvitationDocument;
  change: (next: InvitationDocument) => void;
  assets: Asset[];
  uploaded: (asset: Asset) => void;
}) {
  const [link, setLink] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <details>
      <summary>Musique de l’invitation</summary>
      <p>
        Importez un fichier que vous avez le droit de partager ou utilisez un
        lecteur YouTube / Spotify.
      </p>
      <label>
        Musique importée
        <select
          disabled={busy}
          value={document.music?.mediaId ?? ''}
          onChange={(event) =>
            change({
              ...document,
              externalMusic: undefined,
              music: event.target.value
                ? { mediaId: event.target.value, volume: 0.5, loop: true }
                : undefined,
            })
          }
        >
          <option value="">Aucune musique importée</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Importer une musique
        <input
          type="file"
          accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm"
          disabled={busy}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setMessage('Import en cours…');
            try {
              const started = await beginMusicAction(eventId, {
                name: file.name,
                mime: file.type,
                size: file.size,
                consent: true,
                author: 'Organisateur',
              });
              if (!started.ok) throw new Error(started.error);
              const body = new FormData();
              Object.entries(started.data.fields).forEach(([key, value]) =>
                body.append(key, value),
              );
              body.append('file', file);
              if (!(await fetch(started.data.url, { method: 'POST', body })).ok)
                throw new Error('Transfert interrompu.');
              const result = await finishMusicAction(
                eventId,
                started.data.id,
                started.data.secret,
              );
              if (!result.ok) throw new Error(result.error);
              uploaded(result.asset);
              setMessage(
                'Musique importée. Sélectionnez-la dans la liste pour l’utiliser.',
              );
            } catch (error) {
              setMessage(
                error instanceof Error ? error.message : 'Import impossible.',
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {document.music && (
        <>
          <label>
            Volume
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={document.music.volume}
              onChange={(event) =>
                change({
                  ...document,
                  music: {
                    ...document.music!,
                    volume: Number(event.target.value),
                  },
                })
              }
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={document.music.loop}
              onChange={(event) =>
                change({
                  ...document,
                  music: { ...document.music!, loop: event.target.checked },
                })
              }
            />{' '}
            Lecture en boucle
          </label>
        </>
      )}
      <label>
        Lien YouTube ou Spotify
        <input
          type="url"
          value={link}
          onChange={(event) => setLink(event.target.value)}
        />
      </label>
      <button
        onClick={() => {
          try {
            change({
              ...document,
              music: undefined,
              externalMusic: parseMusicLink(link),
            });
            setMessage('Lecteur externe ajouté.');
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : 'Lien invalide.',
            );
          }
        }}
      >
        Utiliser ce lien musical
      </button>
      {document.externalMusic && (
        <p>
          Lecteur{' '}
          {document.externalMusic.provider === 'youtube'
            ? 'YouTube'
            : 'Spotify'}{' '}
          sélectionné. L’invité choisit de le charger et de lancer la lecture.
        </p>
      )}
      {(document.music || document.externalMusic) && (
        <button
          onClick={() =>
            change({ ...document, music: undefined, externalMusic: undefined })
          }
        >
          Retirer la musique
        </button>
      )}
      <p role="status">{message}</p>
    </details>
  );
}
