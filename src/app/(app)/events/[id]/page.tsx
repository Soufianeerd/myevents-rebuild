import { businessPreviewEnabled } from '@/server/experience/service';
import { planningState } from '@/server/planning/service';
import { guestState } from '@/server/guests/service';
import { budgetSummary, taskSummary } from '@/core/planning/models';
import styles from './workspace.module.css';
import { PreviewAccess } from './PreviewAccess';
import * as React from 'react';
import { formatEventDate } from '@/core/events/dates';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEventAction } from '../../actions/events/actions';
import type { EventId } from '../../../../core/ids';
import { DeleteEventButton } from './DeleteEventButton';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventAction(id as EventId);

  if (!event) {
    notFound();
  }

  const [planning, contacts] = await Promise.all([
    planningState(id),
    guestState(id),
  ]);
  const tasks = taskSummary(planning.document.tasks);
  const budget = budgetSummary(planning.document.budget);
  const euros = (cents: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-6">
        <div className="min-w-0 break-words">
          <div className="text-[11px] font-medium uppercase tracking-[1.6px] text-neutral-500 mb-1">
            {event.type}
          </div>
          <h1 className="text-[26px] font-semibold leading-[34px] tracking-tight text-neutral-900">
            {event.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DeleteEventButton eventId={event.id} />
          <Link
            href={`/events/${event.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-neutral-100 disabled:text-neutral-400 whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active border border-transparent h-10 px-4 text-[14px]"
          >
            Modifier
          </Link>
        </div>
      </div>

      {businessPreviewEnabled() && <PreviewAccess eventId={event.id} />}
      <nav
        aria-label="Gérer cet événement"
        className="flex flex-wrap gap-[12px] my-[24px]"
      >
        {[
          ['organisation', 'Organisation, programme & budget'],
          ['studio', 'Personnaliser mon invitation'],
          ['offres', 'Formules et paiements'],
          ['invites', 'Invités & réponses'],
          ['souvenirs', 'QR codes & souvenirs'],
          ['cartes', 'Cartes de remerciement'],
        ].map(([path, label]) => (
          <Link
            key={path}
            href={`/events/${event.id}/${path}`}
            className="rounded-[8px] border border-neutral-300 bg-white px-[18px] py-[12px] text-primary font-medium"
          >
            {label}
          </Link>
        ))}
      </nav>
      <section
        className={styles.workspace}
        aria-label="Vue d’ensemble de l’événement"
      >
        <div className={styles.stats}>
          <span>{contacts.document.guests.length} contacts</span>
          <span>
            {contacts.responses.filter((r) => r.presence === 'yes').length}{' '}
            réponses positives
          </span>
          <span>
            {tasks.done}/{tasks.total} tâches terminées
          </span>
          <span>{euros(budget.actual)} de dépenses</span>
        </div>
        <div className={styles.grid}>
          <article className={styles.card}>
            <h2>À organiser</h2>
            {planning.document.tasks
              .filter((t) => t.status !== 'done')
              .slice(0, 4)
              .map((t) => (
                <p key={t.id}>
                  {t.title}
                  {t.responsible ? ` · ${t.responsible}` : ''}
                </p>
              ))}
            {!planning.document.tasks.some((t) => t.status !== 'done') && (
              <p>Aucune tâche en attente.</p>
            )}
            <Link href={`/events/${id}/organisation`}>
              Gérer les tâches et le budget →
            </Link>
          </article>
          <article className={styles.card}>
            <h2>Programme</h2>
            {[...planning.document.moments]
              .sort((a, b) => a.start.localeCompare(b.start))
              .slice(0, 4)
              .map((m) => (
                <p key={m.id}>
                  <strong>{m.title}</strong>
                  <br />
                  {formatEventDate(m.start, event.timezone)}
                </p>
              ))}
            {!planning.document.moments.length && (
              <p>
                Ajoutez les moments de votre événement pour retrouver ici le
                programme.
              </p>
            )}
            <Link href={`/events/${id}/organisation`}>
              Organiser le programme et les lieux →
            </Link>
          </article>
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="min-w-0 break-words rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-4">
            Détails
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Date de début
              </dt>
              <dd className="mt-1 text-sm text-neutral-900">
                {formatEventDate(event.startAt, event.timezone)} (
                {event.timezone})
              </dd>
            </div>
            {event.primaryLocation && (
              <div>
                <dt className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Lieu principal
                </dt>
                <dd className="mt-1 text-sm text-neutral-900">
                  {event.primaryLocation}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Langue par défaut
              </dt>
              <dd className="mt-1 text-sm text-neutral-900">
                {event.defaultLanguage.toUpperCase()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-4">
            Statut
          </h2>
          <div className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {event.lifecycleStatus}
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            Cet événement a été créé le{' '}
            {new Date(event.createdAt).toLocaleDateString('fr-FR', {
              timeZone: event.timezone,
            })}
            .
          </p>
        </div>
      </div>
    </div>
  );
}
