'use client';
import { useEffect, useState } from 'react';
import type { InvitationSection } from '@/core/invitations/models';
import { calendarFile, countdownParts } from '@/core/invitations/presentation';
export function CalendarBlock({
  section,
  title,
}: {
  section: InvitationSection;
  title: string;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const start = setTimeout(update, 0);
    const interval = setInterval(
      update,
      section.calendar?.format === 'seconds' ? 1000 : 15000,
    );
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [section.calendar?.format]);
  if (!section.calendar) return null;
  const config = section.calendar;
  if (section.type === 'countdown') {
    if (now === null) return <p>Le compte à rebours se prépare…</p>;
    const parts = countdownParts(config.startAt, now);
    return (
      <p aria-label="Compte à rebours">
        {parts.total <= 0 ? (
          config.afterText
        ) : (
          <>
            {parts.days} j {config.format !== 'days' && `${parts.hours} h `}
            {['minutes', 'seconds'].includes(config.format) &&
              `${parts.minutes} min `}
            {config.format === 'seconds' && `${parts.seconds} s`}
          </>
        )}
      </p>
    );
  }
  let date: string;
  try {
    date = new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: config.timezone,
    }).format(new Date(config.startAt));
  } catch {
    return <p>Vérifiez le fuseau horaire du calendrier.</p>;
  }
  return (
    <div>
      <p>
        <time dateTime={config.startAt}>{date}</time>
      </p>
      <p>{config.timezone}</p>
      <a
        href={`data:text/calendar;charset=utf-8,${encodeURIComponent(calendarFile(section, title))}`}
        download="myevents.ics"
      >
        Ajouter à mon calendrier
      </a>
    </div>
  );
}
