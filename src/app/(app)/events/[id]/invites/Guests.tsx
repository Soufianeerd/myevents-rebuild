'use client';
import { useState } from 'react';
import { ReminderPanel } from './ReminderPanel';
import { GuestCollections } from './GuestCollections';
import { ResponseAssignments } from './ResponseAssignments';
import {
  assignCollection,
  collectionKey,
  guestCollections,
  type CollectionKind,
} from '@/core/guests/groupings';
import { replyFor } from '@/core/guests/responses';
import type { RsvpResponse } from '@/core/invitations/models';
import { readGuestFile } from '@/features/guests/readGuestFile';
import {
  guestSchema,
  mapGuestRows,
  guestStatuses,
  mergeGuestImport,
  guestsCsv,
  type Guest,
  type GuestBook,
  type GuestBookRecord,
} from '@/core/guests/models';
import {
  saveGuestsAction,
  guestLinkAction,
  attachResponseAction,
} from './actions';
import styles from '../workspace.module.css';
const labels = {
  name: 'Nom',
  email: 'E-mail',
  phone: 'Téléphone',
  household: 'Foyer',
  group: 'Groupe',
  table: 'Table',
  notes: 'Notes',
} as const;
const importLabels = {
  ...labels,
  status: 'Statut',
  maxCompanions: 'Accompagnants maximum',
} as const;
const statuses = {
  not_invited: 'Pas encore invité',
  sent: 'Invitation envoyée',
  opened: 'Invitation ouverte',
  pending: 'En attente',
  yes: 'Présent',
  no: 'Absent',
  incomplete: 'Réponse incomplète',
};
export default function Guests({
  eventId,
  initial,
  responses,
  revision: initialRevision,
}: {
  eventId: string;
  initial: GuestBook;
  responses: Array<RsvpResponse & { createdAt: string }>;
  revision: number;
}) {
  const [book, setBook] = useState(initial),
    [revision, setRevision] = useState(initialRevision),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [personalLink, setPersonalLink] = useState<{
      name: string;
      url: string;
    } | null>(null),
    [editing, setEditing] = useState<Guest | null>(null),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState(''),
    [group, setGroup] = useState(''),
    [household, setHousehold] = useState(''),
    [sort, setSort] = useState<'name' | 'household' | 'group' | 'table'>(
      'name',
    ),
    [selected, setSelected] = useState<string[]>([]),
    [bulkGroup, setBulkGroup] = useState(''),
    [bulkHousehold, setBulkHousehold] = useState(''),
    [rows, setRows] = useState<string[][]>([]),
    [mapping, setMapping] = useState<Record<string, string>>({});
  function applyRecord(record: GuestBookRecord) {
    setBook(record.document);
    setRevision(record.revision);
    setEditing(null);
    setHousehold(
      (current) =>
        guestCollections(record.document.guests, responses, 'household').find(
          (item) => item.key === collectionKey(current),
        )?.name ?? '',
    );
    setGroup(
      (current) =>
        guestCollections(record.document.guests, responses, 'group').find(
          (item) => item.key === collectionKey(current),
        )?.name ?? '',
    );
    setSelected((ids) =>
      ids.filter((id) =>
        record.document.guests.some((guest) => guest.id === id),
      ),
    );
  }
  async function save(next: GuestBook) {
    setBusy(true);
    setMessage('');
    try {
      const result = await saveGuestsAction(eventId, next, revision);
      if (!result.ok) throw new Error(result.error);
      applyRecord(result.record);
      setMessage('Liste enregistrée.');
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Enregistrement impossible.',
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  const visible = book.guests
    .filter(
      (g) =>
        (!status ||
          (replyFor(g, responses)?.presence ?? g.status) === status) &&
        (!group || collectionKey(g.group) === collectionKey(group)) &&
        (!household ||
          collectionKey(g.household) === collectionKey(household)) &&
        [g.name, g.email, g.household, g.phone]
          .join(' ')
          .toLocaleLowerCase('fr')
          .includes(query.toLocaleLowerCase('fr')),
    )
    .sort(
      (a, b) =>
        a[sort].localeCompare(b[sort], 'fr') ||
        a.name.localeCompare(b.name, 'fr'),
    );
  const chosen = visible.filter((guest) => selected.includes(guest.id));
  const households = guestCollections(book.guests, responses, 'household');
  const groups = guestCollections(book.guests, responses, 'group');
  function filterCollection(kind: CollectionKind, name: string) {
    setHousehold(kind === 'household' ? name : '');
    setGroup(kind === 'group' ? name : '');
    setQuery('');
    setStatus('');
    setSelected([]);
    document
      .getElementById('guest-list')
      ?.scrollIntoView({ behavior: 'instant' });
  }
  function download(guests: Guest[]) {
    const url = URL.createObjectURL(
      new Blob([guestsCsv(guests)], { type: 'text/csv;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invites.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section aria-label="Carnet des invités">
      <h2>Votre liste d’invités</h2>
      <p>
        Gérez vos contacts, foyers et groupes. Les réponses reçues depuis
        l’invitation restent consultables plus bas.
      </p>
      <div className={styles.stats}>
        <span>{book.guests.length} contacts</span>
        <span>{households.length} foyers</span>
        <span>{groups.length} groupes</span>
      </div>
      <div className={styles.stats}>
        <button
          disabled={busy}
          onClick={() =>
            setEditing(
              guestSchema.parse({
                id: crypto.randomUUID(),
                name: 'Nouvel invité',
              }),
            )
          }
        >
          Ajouter un invité
        </button>
        <button onClick={() => download(visible)}>
          Exporter la liste filtrée
        </button>
        <button onClick={() => download([])}>Modèle CSV</button>
      </div>
      <GuestCollections
        book={book}
        responses={responses}
        busy={busy}
        onSave={save}
        onFilter={filterCollection}
      />
      <ResponseAssignments
        book={book}
        responses={responses}
        busy={busy}
        onAttach={async (responseId, guestId) => {
          setBusy(true);
          setMessage('');
          try {
            const result = await attachResponseAction(
              eventId,
              { responseId, guestId },
              revision,
            );
            if (!result.ok) throw new Error(result.error);
            applyRecord(result.record);
            setMessage('Réponse rattachée au carnet.');
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : 'Rattachement impossible.',
            );
          } finally {
            setBusy(false);
          }
        }}
      />
      <ReminderPanel
        eventId={eventId}
        guests={book.guests}
        responses={responses}
      />
      <p role="status" aria-label="État du carnet">
        {message}
      </p>
      {personalLink && (
        <div className={styles.notice}>
          <strong>Invitation de {personalLink.name}</strong>
          <p>
            Ce lien préremplit l’invité et lui permet d’actualiser sa réponse.
            Partagez-le uniquement avec la personne concernée.
          </p>
          <a href={personalLink.url} target="_blank" rel="noreferrer">
            Ouvrir l’invitation personnelle
          </a>
          <label>
            Lien personnel
            <input
              readOnly
              value={personalLink.url}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(personalLink.url);
                setMessage('Lien copié.');
              } catch {
                setMessage('Sélectionnez le lien ci-dessus pour le copier.');
              }
            }}
          >
            Copier le lien personnel
          </button>
        </div>
      )}
      <div className={styles.grid} id="guest-list">
        <label>
          Rechercher un invité
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected([]);
            }}
          />
        </label>
        <label>
          Statut
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setSelected([]);
            }}
          >
            <option value="">Tous les statuts</option>
            {guestStatuses.map((s) => (
              <option key={s} value={s}>
                {statuses[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Filtrer par groupe
          <select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setSelected([]);
            }}
          >
            <option value="">Tous les groupes</option>
            {groups.map((g) => (
              <option key={g.key}>{g.name}</option>
            ))}
          </select>
        </label>
        <label>
          Filtrer par foyer
          <select
            value={household}
            onChange={(e) => {
              setHousehold(e.target.value);
              setSelected([]);
            }}
          >
            <option value="">Tous les foyers</option>
            {households.map((item) => (
              <option key={item.key}>{item.name}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Trier les invités
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
        >
          <option value="name">Nom</option>
          <option value="household">Foyer</option>
          <option value="group">Groupe</option>
          <option value="table">Table</option>
        </select>
      </label>
      {editing && (
        <form
          className={styles.card}
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const guest = guestSchema.parse(editing);
              if (
                await save({
                  guests: [
                    ...book.guests.filter((g) => g.id !== guest.id),
                    guest,
                  ],
                })
              )
                setEditing(null);
            } catch {
              setMessage(
                'Vérifiez le nom, l’adresse e-mail et le nombre d’accompagnants.',
              );
            }
          }}
        >
          <h3>Fiche invité</h3>
          <fieldset disabled={busy}>
            <div className={styles.grid}>
              {Object.entries(labels).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    required={key === 'name'}
                    type={key === 'email' ? 'email' : 'text'}
                    value={editing[key as keyof typeof labels]}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        [key]: e.target.value,
                        ...(key === 'household'
                          ? { householdAssigned: true }
                          : {}),
                      })
                    }
                  />
                </label>
              ))}
              <label>
                Accompagnants maximum
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={editing.maxCompanions}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      maxCompanions: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Statut manuel
                <select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as Guest['status'],
                    })
                  }
                >
                  {guestStatuses.map((s) => (
                    <option key={s} value={s}>
                      {statuses[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.stats}>
              <button>Enregistrer l’invité</button>
              <button type="button" onClick={() => setEditing(null)}>
                Annuler
              </button>
            </div>
            {editing.responseId && (
              <div>
                <p>
                  Une réponse du lien général a été rattachée à ce contact. En
                  cas d’erreur, détachez-la pour choisir le bon contact. La
                  réponse, le contact et son foyer seront conservés.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      await save({
                        guests: book.guests.map((guest) =>
                          guest.id === editing.id
                            ? { ...guest, responseId: undefined }
                            : guest,
                        ),
                      })
                    )
                      setEditing(null);
                  }}
                >
                  Détacher la réponse
                </button>
              </div>
            )}
          </fieldset>
        </form>
      )}
      <details className={styles.card}>
        <summary>Importer un fichier CSV ou Excel</summary>
        <p>
          Choisissez un fichier CSV UTF-8 ou Excel (.xlsx) de 2 Mo maximum. La
          première feuille Excel est utilisée. Vérifiez les colonnes avant de
          confirmer. Les adresses e-mail déjà présentes sont ignorées.
        </p>
        <label>
          Fichier CSV ou Excel
          <input
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={busy}
            onChange={async (e) => {
              try {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2000000)
                  throw new Error('Le fichier dépasse 2 Mo.');
                const parsed = await readGuestFile(file);
                if (parsed.length < 2)
                  throw new Error('Le fichier ne contient aucun invité.');
                setRows(parsed);
                setMapping(
                  Object.fromEntries(
                    Object.keys(importLabels).map((key) => [
                      key,
                      String(
                        parsed[0].findIndex(
                          (h) =>
                            h.trim().toLowerCase() === key ||
                            h.trim().toLowerCase() ===
                              importLabels[
                                key as keyof typeof importLabels
                              ].toLowerCase(),
                        ),
                      ),
                    ]),
                  ),
                );
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : 'Fichier invalide.',
                );
                setRows([]);
              }
            }}
          />
        </label>
        {!!rows.length && (
          <>
            <div className={styles.grid}>
              {Object.entries(importLabels).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <select
                    value={mapping[key] ?? '-1'}
                    onChange={(e) =>
                      setMapping({ ...mapping, [key]: e.target.value })
                    }
                  >
                    <option value="-1">Ignorer</option>
                    {rows[0].map((h, i) => (
                      <option key={i} value={i}>
                        {h || `Colonne ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <p>
              {rows.length - 1} lignes à examiner — aperçu des cinq premières :
            </p>
            <div className={styles.tableWrap}>
              <table>
                <tbody>
                  {rows.slice(1, 6).map((r, i) => (
                    <tr key={i}>
                      {r.map((cell, j) => (
                        <td key={j}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              disabled={busy || Number(mapping.name) < 0}
              onClick={async () => {
                try {
                  const guests = mapGuestRows(rows, mapping, () =>
                    crypto.randomUUID(),
                  );
                  const merged = mergeGuestImport(book, guests);
                  if (await save(merged.document)) {
                    setRows([]);
                    setMessage(
                      `${merged.added} invités importés, ${merged.skipped} doublons ignorés.`,
                    );
                  }
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : 'Import impossible.',
                  );
                }
              }}
            >
              Confirmer l’import
            </button>
          </>
        )}
      </details>
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Sélectionner les invités affichés"
                  checked={
                    visible.length > 0 &&
                    visible.every((g) => selected.includes(g.id))
                  }
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? visible.map((g) => g.id) : [],
                    )
                  }
                />
              </th>
              <th>Nom</th>
              <th>Contact</th>
              <th>Foyer / groupe</th>
              <th>Table</th>
              <th>Statut manuel</th>
              <th>RSVP reçu</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((g) => (
              <tr key={g.id}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Sélectionner ${g.name}`}
                    checked={selected.includes(g.id)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, g.id]
                          : selected.filter((id) => id !== g.id),
                      )
                    }
                  />
                </td>
                <td>{g.name}</td>
                <td>
                  {g.email}
                  <br />
                  {g.phone}
                </td>
                <td>
                  {g.household || '—'} / {g.group || '—'}
                </td>
                <td>{g.table || '—'}</td>
                <td>{statuses[g.status]}</td>
                <td>
                  {replyFor(g, responses)?.presence === 'yes'
                    ? 'Présent'
                    : replyFor(g, responses)?.presence === 'no'
                      ? 'Absent'
                      : 'Sans réponse'}
                </td>
                <td>
                  <button disabled={busy} onClick={() => setEditing(g)}>
                    Modifier {g.name}
                  </button>
                  <button
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        const result = await guestLinkAction(eventId, g.id);
                        if (!result.ok) throw new Error(result.error);
                        setPersonalLink({ name: g.name, url: result.url });
                        setMessage('Lien personnel prêt.');
                      } catch (error) {
                        setMessage(
                          error instanceof Error
                            ? error.message
                            : 'Lien indisponible.',
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Lien pour {g.name}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length && <p>Aucun invité dans cette liste.</p>}
      {!!chosen.length && (
        <fieldset disabled={busy} className={styles.card}>
          <legend>{chosen.length} invités sélectionnés</legend>
          <label>
            Nouveau foyer
            <input
              value={bulkHousehold}
              onChange={(e) => setBulkHousehold(e.target.value)}
              maxLength={150}
              list="known-households"
            />
          </label>
          <datalist id="known-households">
            {households.map((item) => (
              <option key={item.key} value={item.name} />
            ))}
          </datalist>
          <label>
            Nouveau groupe
            <input
              value={bulkGroup}
              onChange={(e) => setBulkGroup(e.target.value)}
              maxLength={100}
            />
          </label>
          <div className={styles.stats}>
            <button
              onClick={() =>
                save(
                  assignCollection(
                    book,
                    chosen.map((g) => g.id),
                    'household',
                    bulkHousehold,
                  ),
                )
              }
            >
              Appliquer le foyer
            </button>
            <button
              onClick={() =>
                save(
                  assignCollection(
                    book,
                    chosen.map((g) => g.id),
                    'group',
                    bulkGroup,
                  ),
                )
              }
            >
              Appliquer le groupe
            </button>
            <button onClick={() => download(chosen)}>
              Exporter la sélection
            </button>
            <button
              onClick={async () => {
                if (
                  window.confirm(
                    'Supprimer les contacts sélectionnés ? Les réponses RSVP reçues seront conservées.',
                  )
                ) {
                  if (
                    await save({
                      guests: book.guests.filter(
                        (g) => !chosen.some((guest) => guest.id === g.id),
                      ),
                    })
                  )
                    setSelected([]);
                }
              }}
            >
              Supprimer la sélection
            </button>
          </div>
        </fieldset>
      )}
    </section>
  );
}
