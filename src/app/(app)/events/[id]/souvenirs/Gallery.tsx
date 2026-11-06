'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/Dialog';
import { MediaControls } from './Controls';
import { moderateManyAction } from './actions';
import styles from '../workspace.module.css';
type Item = {
  id: string;
  name: string;
  author: string;
  mime: string;
  size: number;
  kind: string;
  purpose: string;
  status: string;
  hidden: boolean;
  favorite: boolean;
  createdAt: string;
  url: string | null;
  download: string | null;
};
function Preview({ item, large = false }: { item: Item; large?: boolean }) {
  if (!item.url) return <p>Dépôt en attente de validation.</p>;
  return item.mime.startsWith('audio/') ? (
    <audio controls src={item.url} preload="metadata" />
  ) : item.mime.startsWith('video/') ? (
    <video
      controls
      src={item.url}
      preload="metadata"
      style={{ width: '100%', maxHeight: large ? '65vh' : 260 }}
    />
  ) : (
    <Image
      src={item.url}
      alt={item.name}
      width={1000}
      height={700}
      unoptimized
      style={{
        width: '100%',
        height: large ? 'auto' : 200,
        maxHeight: large ? '65vh' : 200,
        objectFit: large ? 'contain' : 'cover',
        borderRadius: 6,
      }}
    />
  );
}
export function Gallery({
  eventId,
  items,
}: {
  eventId: string;
  items: Item[];
}) {
  const previewTrigger = useRef<HTMLButtonElement | null>(null);
  const [kind, setKind] = useState('souvenirs'),
    [query, setQuery] = useState(''),
    [favorite, setFavorite] = useState(false),
    [sort, setSort] = useState('recent'),
    [selected, setSelected] = useState<string[]>([]),
    [active, setActive] = useState<Item | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const visible = items
    .filter(
      (item) =>
        (kind === 'all' ||
          (kind === 'studio' && item.purpose === 'design') ||
          (item.purpose !== 'design' &&
            (kind === 'souvenirs' || item.mime.startsWith(kind + '/')))) &&
        (!favorite || item.favorite) &&
        [item.name, item.author]
          .join(' ')
          .toLocaleLowerCase('fr')
          .includes(query.toLocaleLowerCase('fr')),
    )
    .sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name, 'fr')
        : sort === 'oldest'
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt),
    );
  const selectable = visible.slice(0, 100);
  const selection = visible.filter((item) => selected.includes(item.id));
  async function bulk(patch: unknown) {
    setBusy(true);
    setMessage('');
    try {
      const result = await moderateManyAction(
        eventId,
        selection.map((item) => item.id),
        patch,
      );
      setSelected(result.failed);
      setMessage(
        `${result.updated} fichier${result.updated > 1 ? 's' : ''} modifié${result.updated > 1 ? 's' : ''}.${result.failed.length ? ` ${result.failed.length} non modifié(s). Réessayez individuellement pour connaître la raison.` : ''}`,
      );
    } catch {
      setMessage(
        'Modification interrompue. Rechargez la page pour vérifier les fichiers.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label="Galerie de vos médias">
      <div className={styles.grid}>
        <label>
          Type de média
          <select
            disabled={busy}
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setSelected([]);
            }}
          >
            <option value="souvenirs">Tous les souvenirs</option>
            <option value="image">Photos</option>
            <option value="video">Vidéos</option>
            <option value="audio">Audio</option>
            <option value="studio">Images du Studio</option>
            <option value="all">Tous les fichiers</option>
          </select>
        </label>
        <label>
          Rechercher un fichier ou un auteur
          <input
            disabled={busy}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected([]);
            }}
          />
        </label>
        <label>
          Trier les médias
          <select
            disabled={busy}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="name">Nom</option>
          </select>
        </label>
      </div>
      <label>
        <input
          type="checkbox"
          checked={favorite}
          disabled={busy}
          onChange={(e) => {
            setFavorite(e.target.checked);
            setSelected([]);
          }}
        />
        Mes favoris uniquement
      </label>
      <label>
        <input
          type="checkbox"
          checked={
            selectable.length > 0 &&
            selectable.every((i) => selected.includes(i.id))
          }
          disabled={busy || selectable.length === 0}
          onChange={(e) =>
            setSelected(e.target.checked ? selectable.map((i) => i.id) : [])
          }
        />
        Sélectionner les fichiers affichés (100 maximum)
      </label>
      {!!selection.length && (
        <fieldset disabled={busy} className={styles.card}>
          <legend>
            {selection.length} fichier{selection.length > 1 ? 's' : ''}{' '}
            sélectionné{selection.length > 1 ? 's' : ''}
          </legend>
          <div className={styles.stats}>
            {selection.every((item) => item.status === 'ready') && (
              <a
                className={styles.link}
                href={`/events/${eventId}/souvenirs/export?${new URLSearchParams(
                  [
                    ['scope', 'selection'],
                    ...selection.map((item) => ['id', item.id]),
                  ],
                ).toString()}`}
              >
                Télécharger la sélection (.zip)
              </a>
            )}
            <button onClick={() => void bulk({ favorite: true })}>
              Mettre en favoris
            </button>
            <button
              disabled={selection.some(
                (item) =>
                  item.purpose === 'design' || item.mime.startsWith('audio/'),
              )}
              onClick={() => void bulk({ hidden: true })}
            >
              Masquer la sélection
            </button>
            <button
              disabled={selection.some(
                (item) =>
                  item.purpose === 'design' || item.mime.startsWith('audio/'),
              )}
              onClick={() => void bulk({ hidden: false })}
            >
              Montrer la sélection aux invités
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Supprimer définitivement les fichiers sélectionnés ?',
                  )
                )
                  void bulk({ status: 'deleted' });
              }}
            >
              Supprimer la sélection
            </button>
          </div>
        </fieldset>
      )}
      <p role="status">{message}</p>
      <p>
        {visible.length} fichier{visible.length > 1 ? 's' : ''} affiché
        {visible.length > 1 ? 's' : ''}
      </p>
      <div className={styles.mediaGrid}>
        {visible.map((item) => (
          <article key={item.id} className={styles.card}>
            <label>
              <input
                type="checkbox"
                aria-label={`Sélectionner ${item.name}`}
                checked={selected.includes(item.id)}
                disabled={
                  busy ||
                  (!selected.includes(item.id) && selection.length >= 100)
                }
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...selected, item.id]
                      : selected.filter((id) => id !== item.id),
                  )
                }
              />
              Sélectionner
            </label>
            <h2>{item.name}</h2>
            {item.hidden &&
              item.purpose !== 'design' &&
              !item.mime.startsWith('audio/') && <p>Masqué aux invités</p>}
            <Preview item={item} />
            <p>
              {item.author || 'Invité'} ·{' '}
              {new Date(item.createdAt).toLocaleDateString('fr-FR')} ·{' '}
              {(item.size / 1000000).toFixed(1)} Mo{' '}
              {item.favorite ? '· Favori' : ''}
            </p>
            {item.url && (
              <div className={styles.stats}>
                <button
                  onClick={(e) => {
                    previewTrigger.current = e.currentTarget;
                    setActive(item);
                  }}
                >
                  Agrandir {item.name}
                </button>
                <a className={styles.link} href={item.download!}>
                  Télécharger {item.name}
                </a>
              </div>
            )}
            {item.purpose === 'design' && (
              <p>
                Image de composition privée. Sa visibilité dépend uniquement de
                l’invitation publiée.
              </p>
            )}
            <details>
              <summary>Gérer ce fichier</summary>
              <MediaControls eventId={eventId} item={item} />
            </details>
          </article>
        ))}
      </div>
      {!visible.length && <p>Aucun fichier ne correspond à ces filtres.</p>}
      <Dialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            previewTrigger.current?.focus();
          }}
          className="max-w-[1000px] max-h-[90vh] overflow-auto"
        >
          {active && (
            <>
              <DialogTitle>{active.name}</DialogTitle>
              <DialogDescription>
                {active.author || 'Invité'} · Aperçu du souvenir
              </DialogDescription>
              <Preview item={active} large />
              <DialogClose className="rounded-md border p-3">
                Fermer l’aperçu
              </DialogClose>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
