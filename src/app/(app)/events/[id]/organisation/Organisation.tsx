'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  planningSchema,
  budgetSummary,
  taskSummary,
  type Planning,
  type PlanningKind,
} from '@/core/planning/models';
import { toEventInstant, toEventLocalTime } from '@/core/events/dates';
import { savePlanningAction } from './actions';
import styles from '../workspace.module.css';
type Field = {
  key: string;
  label: string;
  type?:
    | 'text'
    | 'textarea'
    | 'date'
    | 'datetime-local'
    | 'money'
    | 'number'
    | 'email'
    | 'select'
    | 'venue';
  options?: [string, string][];
  required?: boolean;
};
const statusOptions: [string, string][] = [
  ['todo', 'À faire'],
  ['doing', 'En cours'],
  ['blocked', 'Bloqué'],
  ['done', 'Terminé'],
];
const config: Record<
  PlanningKind,
  { title: string; singular: string; fields: Field[] }
> = {
  tasks: {
    title: 'Tâches',
    singular: 'une tâche',
    fields: [
      { key: 'title', label: 'Titre', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'responsible', label: 'Responsable' },
      { key: 'category', label: 'Catégorie' },
      { key: 'date', label: 'Échéance', type: 'date' },
      {
        key: 'priority',
        label: 'Priorité',
        type: 'select',
        options: [
          ['normal', 'Normale'],
          ['high', 'Haute'],
          ['low', 'Basse'],
        ],
      },
      {
        key: 'status',
        label: 'Statut',
        type: 'select',
        options: statusOptions,
      },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  budget: {
    title: 'Budget',
    singular: 'une dépense',
    fields: [
      { key: 'title', label: 'Dépense', required: true },
      { key: 'category', label: 'Catégorie' },
      { key: 'supplier', label: 'Prestataire' },
      { key: 'planned', label: 'Budget prévu (€)', type: 'money' },
      { key: 'actual', label: 'Coût réel (€)', type: 'money' },
      { key: 'deposit', label: 'Acompte (€)', type: 'money' },
      { key: 'paid', label: 'Montant payé (€)', type: 'money' },
      { key: 'due', label: 'Échéance', type: 'date' },
      {
        key: 'status',
        label: 'Statut',
        type: 'select',
        options: [
          ['planned', 'Prévu'],
          ['committed', 'Engagé'],
          ['paid', 'Payé'],
        ],
      },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  suppliers: {
    title: 'Prestataires',
    singular: 'un prestataire',
    fields: [
      { key: 'name', label: 'Entreprise', required: true },
      { key: 'category', label: 'Type de prestation' },
      { key: 'contact', label: 'Contact' },
      { key: 'phone', label: 'Téléphone' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'price', label: 'Prix (€)', type: 'money' },
      { key: 'deposit', label: 'Acompte (€)', type: 'money' },
      { key: 'due', label: 'Échéance', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  venues: {
    title: 'Lieux',
    singular: 'un lieu',
    fields: [
      { key: 'name', label: 'Nom du lieu', required: true },
      { key: 'address', label: 'Adresse' },
      { key: 'capacity', label: 'Capacité', type: 'number' },
      {
        key: 'notes',
        label: 'Accès et informations pratiques',
        type: 'textarea',
      },
    ],
  },
  moments: {
    title: 'Programme',
    singular: 'un moment',
    fields: [
      { key: 'title', label: 'Nom du moment', required: true },
      { key: 'start', label: 'Début', type: 'datetime-local', required: true },
      { key: 'end', label: 'Fin', type: 'datetime-local', required: true },
      { key: 'venueId', label: 'Lieu', type: 'venue' },
      {
        key: 'visibility',
        label: 'Visibilité',
        type: 'select',
        options: [
          ['public', 'Tous les invités'],
          ['private', 'Équipe uniquement'],
          ['invited', 'Sur invitation'],
        ],
      },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  notes: {
    title: 'Notes',
    singular: 'une note',
    fields: [
      { key: 'title', label: 'Titre', required: true },
      { key: 'text', label: 'Votre note', type: 'textarea' },
    ],
  },
};
type Item = { id: string; [key: string]: unknown };
const euro = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  );
export function Organisation({
  eventId,
  eventName,
  timezone,
  initial,
  revision: initialRevision,
}: {
  eventId: string;
  eventName: string;
  timezone: string;
  initial: Planning;
  revision: number;
}) {
  const [document, setDocument] = useState(initial),
    [revision, setRevision] = useState(initialRevision),
    [kind, setKind] = useState<PlanningKind>('tasks'),
    [editing, setEditing] = useState<Item | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [search, setSearch] = useState(''),
    [view, setView] = useState<'list' | 'kanban'>('list');
  const summary = budgetSummary(document.budget),
    tasks = taskSummary(document.tasks);
  const items = (document[kind] as Item[]).filter((i) =>
    Object.values(i).some(
      (v) =>
        typeof v === 'string' &&
        v.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    ),
  );
  const fields = config[kind].fields;
  async function save(next: Planning) {
    const previous = document;
    setDocument(next);
    setBusy(true);
    const result = await savePlanningAction(eventId, next, revision);
    if (result.ok) {
      setDocument(result.record.document);
      setRevision(result.record.revision);
      setMessage('Enregistré.');
      setEditing(null);
    } else {
      setDocument(previous);
      setMessage(result.error);
    }
    setBusy(false);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    try {
      const form = new FormData(e.currentTarget);
      const item: Item = { ...editing };
      for (const field of fields) {
        const raw = String(form.get(field.key) ?? '');
        item[field.key] =
          field.type === 'money'
            ? Math.round(Number(raw || 0) * 100)
            : field.type === 'number'
              ? Number(raw || 0)
              : field.type === 'datetime-local'
                ? toEventInstant(raw, timezone)
                : raw;
      }
      const next = planningSchema.parse({
        ...document,
        [kind]: [...document[kind].filter((i) => i.id !== item.id), item],
      });
      await save(next);
    } catch (error) {
      setMessage(
        error instanceof Error && error.name !== 'ZodError'
          ? error.message
          : 'Vérifiez les champs, les montants et les dates.',
      );
    }
  }
  function card(item: Item) {
    return (
      <article className={styles.card} key={item.id}>
        <h2>{String(item.title ?? item.name)}</h2>
        {fields
          .filter(
            (f) =>
              !['title', 'name'].includes(f.key) &&
              item[f.key] !== '' &&
              item[f.key] != null,
          )
          .map((f) => (
            <p key={f.key}>
              <strong>{f.label} : </strong>
              {f.type === 'money'
                ? euro(Number(item[f.key]))
                : f.options
                  ? f.options.find(([value]) => value === item[f.key])?.[1]
                  : f.type === 'venue'
                    ? document.venues.find((v) => v.id === item[f.key])?.name
                    : f.type === 'datetime-local'
                      ? toEventLocalTime(String(item[f.key]), timezone).replace(
                          'T',
                          ' · ',
                        )
                      : String(item[f.key])}
            </p>
          ))}
        {kind === 'budget' && (
          <p>
            <strong>
              Reste à payer :{' '}
              {euro(Math.max(0, Number(item.actual) - Number(item.paid)))}
            </strong>
          </p>
        )}
        {kind === 'tasks' && (
          <label>
            <input
              type="checkbox"
              checked={item.status === 'done'}
              disabled={busy}
              onChange={(e) =>
                void save(
                  planningSchema.parse({
                    ...document,
                    tasks: document.tasks.map((t) =>
                      t.id === item.id
                        ? { ...t, status: e.target.checked ? 'done' : 'todo' }
                        : t,
                    ),
                  }),
                )
              }
            />
            Tâche terminée
          </label>
        )}
        {kind === 'venues' && item.address ? (
          <p>
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(item.address))}`}
            >
              Voir l’adresse sur la carte
            </a>
          </p>
        ) : null}
        <p>
          <button disabled={busy} onClick={() => setEditing(item)}>
            Modifier
          </button>
        </p>
        <button
          disabled={busy}
          onClick={() => {
            if (
              kind === 'venues' &&
              document.moments.some((moment) => moment.venueId === item.id)
            ) {
              setMessage(
                'Ce lieu est utilisé dans le programme. Modifiez les moments concernés avant de le supprimer.',
              );
              return;
            }
            if (window.confirm('Supprimer cet élément ?'))
              void save(
                planningSchema.parse({
                  ...document,
                  [kind]: document[kind].filter((i) => i.id !== item.id),
                }),
              );
          }}
        >
          Supprimer
        </button>
      </article>
    );
  }
  return (
    <div className={styles.workspace}>
      <Link href={`/events/${eventId}`}>← Mon événement</Link>
      <p>{eventName}</p>
      <h1>Tout préparer, sereinement</h1>
      <div className={styles.stats}>
        <span>
          {tasks.done}/{tasks.total} tâches terminées
        </span>
        <span>Prévu : {euro(summary.planned)}</span>
        <span>Engagé : {euro(summary.actual)}</span>
        <span>Payé : {euro(summary.paid)}</span>
        <span>Reste à payer : {euro(summary.remaining)}</span>
      </div>
      <nav aria-label="Organisation" className={styles.stats}>
        {(Object.keys(config) as PlanningKind[]).map((k) => (
          <button
            key={k}
            aria-pressed={kind === k}
            onClick={() => {
              setKind(k);
              setEditing(null);
              setSearch('');
            }}
          >
            {config[k].title} ({document[k].length})
          </button>
        ))}
      </nav>
      <h2>{config[kind].title}</h2>
      <label>
        Rechercher
        <input value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      <p>
        <button
          disabled={busy}
          onClick={() => setEditing({ id: crypto.randomUUID() })}
        >
          Ajouter {config[kind].singular}
        </button>
      </p>
      {kind === 'tasks' && (
        <label>
          Affichage
          <select
            value={view}
            onChange={(e) => setView(e.target.value as 'list' | 'kanban')}
          >
            <option value="list">Liste</option>
            <option value="kanban">Tableau par statut</option>
          </select>
        </label>
      )}
      <p role="status">{message}</p>
      {editing && (
        <section className={styles.card}>
          <h2>
            {document[kind].some((i) => i.id === editing.id)
              ? 'Modifier'
              : 'Ajouter'}{' '}
            {config[kind].singular}
          </h2>
          {kind === 'moments' && <p>Horaires de l’événement : {timezone}</p>}
          <form key={editing.id} onSubmit={submit}>
            <fieldset disabled={busy} style={{ border: 0, padding: 0 }}>
              <div className={styles.grid}>
                {fields.map((f) => {
                  const raw = editing[f.key];
                  const value =
                    raw == null
                      ? ''
                      : f.type === 'money'
                        ? String(Number(raw) / 100)
                        : f.type === 'datetime-local'
                          ? toEventLocalTime(String(raw), timezone)
                          : String(raw);
                  return (
                    <label key={f.key}>
                      {f.label}
                      {f.required ? ' *' : ''}
                      {f.type === 'textarea' ? (
                        <textarea
                          name={f.key}
                          defaultValue={value}
                          rows={4}
                          maxLength={4000}
                        />
                      ) : f.type === 'select' || f.type === 'venue' ? (
                        <select
                          name={f.key}
                          defaultValue={value || f.options?.[0][0]}
                        >
                          {f.type === 'venue' ? (
                            <>
                              <option value="">À préciser</option>
                              {document.venues.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name}
                                </option>
                              ))}
                            </>
                          ) : (
                            f.options!.map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <input
                          name={f.key}
                          type={
                            f.type === 'money' ? 'number' : (f.type ?? 'text')
                          }
                          min={
                            f.type === 'money' || f.type === 'number'
                              ? 0
                              : undefined
                          }
                          step={f.type === 'money' ? '0.01' : undefined}
                          defaultValue={value}
                          required={f.required}
                          maxLength={500}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              <button type="submit">Enregistrer</button>{' '}
              <button type="button" onClick={() => setEditing(null)}>
                Annuler
              </button>
            </fieldset>
          </form>
        </section>
      )}
      {kind === 'tasks' && view === 'kanban' ? (
        <div className={styles.grid}>
          {statusOptions.map(([status, label]) => (
            <section key={status}>
              <h2>{label}</h2>
              {items.filter((i) => i.status === status).map(card)}
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.grid}>{items.map(card)}</div>
      )}
      {!items.length && (
        <p>
          Aucun élément pour le moment. Ajoutez {config[kind].singular} pour
          commencer.
        </p>
      )}
    </div>
  );
}
