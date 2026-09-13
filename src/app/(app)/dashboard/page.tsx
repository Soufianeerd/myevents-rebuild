import { formatEventDate } from '@/core/events/dates';
import * as React from 'react';
import Link from 'next/link';
import { listEventsAction } from '../actions/events/actions';

export const metadata = {
  title: "Mes événements - MyEvent's",
};

export default async function DashboardPage() {
  const events = await listEventsAction();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-6">
        <div>
          <h1 className="text-[26px] font-semibold leading-[34px] tracking-tight text-neutral-900">
            Mes événements
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            Gérez vos différents événements depuis cet espace.
          </p>
        </div>
        <div>
          <Link
            href="/events/new"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-neutral-100 disabled:text-neutral-400 whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active border border-transparent h-10 px-4 text-[14px]"
          >
            Créer un événement
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <p className="text-neutral-500 mb-4">
            Vous n&apos;avez pas encore d&apos;événement.
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-neutral-100 disabled:text-neutral-400 whitespace-nowrap bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 h-10 px-4 text-[14px]"
          >
            Créer mon premier événement
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group block min-w-0 break-words"
            >
              <div className="rounded-xl border border-neutral-200 bg-white p-[18px_20px] shadow-sm transition-shadow hover:shadow-md h-full flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[1.6px] text-neutral-500 mb-2">
                    {event.type}
                  </div>
                  <h2 className="text-lg font-semibold leading-tight tracking-tight text-neutral-900 group-hover:text-black">
                    {event.name}
                  </h2>
                  <div className="mt-2 text-sm text-neutral-500">
                    {formatEventDate(event.startAt, event.timezone)}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center text-xs font-medium text-neutral-500">
                  <span>{event.lifecycleStatus}</span>
                  <span className="text-blue-600">Gérer &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
