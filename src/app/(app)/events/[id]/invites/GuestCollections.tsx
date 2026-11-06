'use client';

import { useId, useState } from 'react';
import type { GuestBook } from '@/core/guests/models';
import {
  assignCollection,
  collectionKey,
  guestCollections,
  renameCollection,
} from '@/core/guests/groupings';
import { replyFor, type ReceivedResponse } from '@/core/guests/responses';
import styles from './guest-collections.module.css';

type CollectionKind = 'household' | 'group';

export function GuestCollections({
  book,
  responses,
  busy,
  onSave,
  onFilter,
}: {
  book: GuestBook;
  responses: ReceivedResponse[];
  busy: boolean;
  onSave: (book: GuestBook) => Promise<boolean>;
  onFilter: (kind: CollectionKind, name: string) => void;
}) {
  const headingId = useId();
  const [kind, setKind] = useState<CollectionKind>('household');
  const [query, setQuery] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [editing, setEditing] = useState<{
    kind: CollectionKind;
    name: string;
    value: string;
  } | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const disabled = busy || saving;
  const households = guestCollections(book.guests, responses, 'household');
  const groups = guestCollections(book.guests, responses, 'group');
  const collections = kind === 'household' ? households : groups;
  const visible = collections.filter(
    (collection) =>
      (!pendingOnly || collection.pending > 0) &&
      collectionKey(
        [
          collection.name,
          ...collection.members.map((member) => member.name),
        ].join(' '),
      ).includes(collectionKey(query)),
  );

  async function persist(next: GuestBook, success: string) {
    setSaving(true);
    setMessage('');
    try {
      if (!(await onSave(next))) {
        setMessage(
          'Les modifications n’ont pas été enregistrées. Consultez le message du carnet.',
        );
        return false;
      }
      setMessage(success);
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Enregistrement impossible.',
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Vos invités, ensemble</p>
          <h2 id={headingId}>Foyers & groupes</h2>
          <p className={styles.description}>
            Retrouvez les membres de chaque foyer et leurs réponses. Les groupes
            vous permettent de réunir famille, amis, collègues ou autres
            contacts.
          </p>
        </div>
        <div className={styles.total}>
          <strong>{households.length}</strong> foyers
          <span aria-hidden="true"> · </span>
          <strong>{groups.length}</strong> groupes
        </div>
      </header>

      <div className={styles.toolbar}>
        <div
          className={styles.kinds}
          role="group"
          aria-label="Afficher les foyers ou les groupes"
        >
          {(
            [
              ['household', 'Foyers', households.length],
              ['group', 'Groupes', groups.length],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              disabled={disabled}
              onClick={() => {
                setKind(value);
                setEditing(null);
                setMessage('');
              }}
            >
              {label} <span>{count}</span>
            </button>
          ))}
        </div>
        <label className={styles.search}>
          Rechercher un foyer, un groupe ou un membre
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className={styles.filterRow}>
        <label>
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={(event) => setPendingOnly(event.target.checked)}
          />
          Avec des membres sans réponse
        </label>
        <span>
          {visible.length}{' '}
          {kind === 'household' ? 'foyers affichés' : 'groupes affichés'}
        </span>
      </div>

      <p className={styles.help}>
        Pour créer un foyer ou un groupe, renseignez la fiche d’un invité ou
        regroupez une sélection dans le carnet. Chaque personne garde sa propre
        réponse RSVP.
      </p>

      <p
        role="status"
        aria-label="État des foyers et groupes"
        className={styles.message}
      >
        {message}
      </p>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <strong>
            {collections.length === 0
              ? kind === 'household'
                ? 'Aucun foyer pour le moment'
                : 'Aucun groupe pour le moment'
              : 'Aucun résultat avec ces filtres'}
          </strong>
          <p>
            {collections.length === 0
              ? 'Associez des invités à un même nom pour retrouver leurs membres ici.'
              : 'Essayez un autre nom ou désactivez le filtre des réponses.'}
          </p>
        </div>
      ) : (
        <div className={styles.cards}>
          {visible.map((collection) => {
            const editingThis =
              editing?.kind === kind &&
              collectionKey(editing.name) === collection.key;
            const mergingInto = editingThis
              ? collections.find(
                  (item) =>
                    item.key !== collection.key &&
                    item.key === collectionKey(editing!.value),
                )
              : undefined;
            const responded = collection.yes + collection.no;
            return (
              <article
                key={`${kind}:${collection.key}`}
                className={styles.card}
                aria-label={`${kind === 'household' ? 'Foyer' : 'Groupe'} ${collection.name}`}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.type}>
                      {kind === 'household' ? 'Foyer' : 'Groupe'}
                    </span>
                    <h3>{collection.name}</h3>
                    <p>
                      {collection.members.length}{' '}
                      {collection.members.length === 1
                        ? 'membre nommé'
                        : 'membres nommés'}
                    </p>
                  </div>
                  <span
                    className={`${styles.badge} ${collection.pending === 0 ? styles.complete : responded > 0 ? styles.partial : styles.pending}`}
                  >
                    {collection.pending === 0
                      ? 'Réponses reçues'
                      : responded > 0
                        ? 'Réponses partielles'
                        : 'Sans réponse'}
                  </span>
                </div>

                <div className={styles.responseCounts}>
                  <span>
                    <strong>{collection.yes}</strong> oui
                  </span>
                  <span>
                    <strong>{collection.no}</strong> non
                  </span>
                  <span>
                    <strong>{collection.pending}</strong> sans réponse
                  </span>
                </div>

                <details className={styles.members}>
                  <summary>Voir les membres et leurs réponses</summary>
                  <ul>
                    {collection.members.map((member) => {
                      const response = replyFor(member, responses);
                      return (
                        <li key={member.id}>
                          <span className={styles.avatar} aria-hidden="true">
                            {member.name
                              .trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join('')
                              .toLocaleUpperCase('fr')}
                          </span>
                          <span className={styles.memberName}>
                            {member.name}
                          </span>
                          <span
                            className={
                              response
                                ? response.presence === 'yes'
                                  ? styles.yes
                                  : styles.no
                                : styles.awaiting
                            }
                          >
                            {response
                              ? response.presence === 'yes'
                                ? 'Présent'
                                : 'Absent'
                              : 'Sans réponse'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </details>

                {editingThis && editing && (
                  <form
                    className={styles.renameForm}
                    onSubmit={async (event) => {
                      event.preventDefault();
                      try {
                        if (!collectionKey(editing.value))
                          throw new Error('Renseignez le nouveau nom.');
                        const next = renameCollection(
                          book,
                          kind,
                          collection.name,
                          editing.value,
                        );
                        if (
                          await persist(
                            next,
                            `${kind === 'household' ? 'Foyer' : 'Groupe'} renommé. Les membres et leurs réponses sont conservés.`,
                          )
                        )
                          setEditing(null);
                      } catch (error) {
                        setMessage(
                          error instanceof Error
                            ? error.message
                            : 'Vérifiez le nom.',
                        );
                      }
                    }}
                  >
                    <fieldset disabled={disabled}>
                      <label>
                        Nouveau nom{' '}
                        {kind === 'household' ? 'du foyer' : 'du groupe'}
                        <input
                          required
                          maxLength={kind === 'household' ? 150 : 100}
                          value={editing.value}
                          onChange={(event) =>
                            setEditing({
                              ...editing,
                              value: event.target.value,
                            })
                          }
                        />
                      </label>
                      {mergingInto && (
                        <p className={styles.mergeNotice}>
                          {mergingInto.name} existe déjà. L’enregistrement
                          réunira les membres des deux{' '}
                          {kind === 'household' ? 'foyers' : 'groupes'} sous ce
                          nom, en conservant leurs réponses.
                        </p>
                      )}
                      <div className={styles.renameActions}>
                        <button type="submit">
                          {mergingInto
                            ? 'Réunir les membres sous ce nom'
                            : 'Enregistrer le nom'}
                        </button>
                        <button
                          type="button"
                          className={styles.secondary}
                          onClick={() => setEditing(null)}
                        >
                          Annuler le renommage
                        </button>
                      </div>
                    </fieldset>
                  </form>
                )}

                <footer className={styles.actions}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onFilter(kind, collection.name)}
                    aria-label={`Voir les invités de ${collection.name}`}
                  >
                    Voir les invités
                  </button>
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={disabled}
                    onClick={() => {
                      setEditing({
                        kind,
                        name: collection.name,
                        value: collection.name,
                      });
                      setMessage('');
                    }}
                    aria-label={`Renommer ${collection.name}`}
                  >
                    Renommer
                  </button>
                  <button
                    type="button"
                    className={styles.dissolve}
                    disabled={disabled}
                    aria-label={`Dissoudre ${collection.name}`}
                    onClick={async () => {
                      if (
                        !window.confirm(
                          `Dissoudre ${kind === 'household' ? 'le foyer' : 'le groupe'} « ${collection.name} » ? Les contacts et leurs réponses RSVP seront conservés ; seul ce regroupement sera retiré.`,
                        )
                      )
                        return;
                      try {
                        const next = assignCollection(
                          book,
                          collection.members.map((member) => member.id),
                          kind,
                          '',
                        );
                        if (
                          await persist(
                            next,
                            `${kind === 'household' ? 'Foyer' : 'Groupe'} dissous. Les contacts et leurs réponses sont conservés.`,
                          )
                        )
                          setEditing(null);
                      } catch (error) {
                        setMessage(
                          error instanceof Error
                            ? error.message
                            : 'Dissolution impossible.',
                        );
                      }
                    }}
                  >
                    Dissoudre
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default GuestCollections;
