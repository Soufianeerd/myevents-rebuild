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
