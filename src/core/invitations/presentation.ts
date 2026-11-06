import type { InvitationDocument, InvitationSection } from './models';
export function invitationImageIds(
  document: InvitationDocument,
  visibleOnly = false,
) {
  return [
    ...new Set([
      ...(document.backgroundMediaId ? [document.backgroundMediaId] : []),
      ...document.sections
        .filter((section) => !visibleOnly || section.visible)
        .flatMap((section) =>
          [section.mediaId, section.backgroundMediaId].filter(
            (id): id is string => !!id,
          ),
        ),
    ]),
  ];
}
export function directionsUrl(
  address: string,
  provider: 'google' | 'waze' = 'google',
) {
  const query = encodeURIComponent(address.trim());
  return provider === 'waze'
    ? `https://waze.com/ul?q=${query}&navigate=yes`
    : `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}
export function withOpacity(hex: string, opacity = 1) {
  return `${hex}${Math.round(Math.min(1, Math.max(0, opacity)) * 255)
    .toString(16)
    .padStart(2, '0')}`;
}
function calendarEscape(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
function utc(value: string) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}
export function calendarFile(section: InvitationSection, title: string) {
  if (!section.calendar) return '';
  const { startAt, endAt, location } = section.calendar;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyEvents//Invitation//FR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${section.id}@myevents`,
    `DTSTAMP:${utc(startAt)}`,
    `DTSTART:${utc(startAt)}`,
    ...(endAt ? [`DTEND:${utc(endAt)}`] : []),
    `SUMMARY:${calendarEscape(title)}`,
    `LOCATION:${calendarEscape(location)}`,
    `DESCRIPTION:${calendarEscape(section.text)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // RFC 5545 line folding is measured in UTF-8 octets, not characters.
  return (
    lines
      .map((line) => {
        let result = '',
          length = 0;
        for (const char of line) {
          const size = new TextEncoder().encode(char).length;
          if (length + size > 74) {
            result += '\r\n ';
            length = 1;
          }
          result += char;
          length += size;
        }
        return result;
      })
      .join('\r\n') + '\r\n'
  );
}
export function countdownParts(startAt: string, now: number) {
  const total = Math.max(
    0,
    Math.floor((new Date(startAt).getTime() - now) / 1000),
  );
  return {
    total,
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
}

export function invitationAssetIds(
  document: InvitationDocument,
  visibleOnly = false,
) {
  return [
    ...invitationImageIds(document, visibleOnly),
    ...(document.music ? [document.music.mediaId] : []),
  ];
}
