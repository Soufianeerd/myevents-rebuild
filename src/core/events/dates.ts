// Dates entered by an organizer are wall times in the event's IANA timezone.
// Persist instants with an explicit offset; never use the server's local zone.
export function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('fr-FR', { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function toEventLocalTime(value: string, timeZone: string): string {
  // Legacy local records had no offset. Preserve their entered wall time.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

export function toEventInstant(value: string, timeZone: string): string {
  if (!isTimeZone(timeZone)) throw new Error('Fuseau horaire invalide.');
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  ) {
    const calendarDate = new Date(`${value.slice(0, 10)}T00:00:00Z`);
    if (
      Number.isNaN(calendarDate.getTime()) ||
      calendarDate.toISOString().slice(0, 10) !== value.slice(0, 10)
    )
      throw new Error('Date invalide.');
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new Error('Date invalide.');
  const wall = Date.parse(`${value}:00Z`);
  if (
    !Number.isFinite(wall) ||
    new Date(wall).toISOString().slice(0, 16) !== value
  ) {
    throw new Error('Date invalide.');
  }
  const candidates = new Set<string>();
  // Sample both sides of nearby timezone transitions to detect skipped/repeated times.
  for (let hours = -36; hours <= 36; hours += 6) {
    const sample = wall + hours * 3_600_000;
    const local = toEventLocalTime(new Date(sample).toISOString(), timeZone);
    const offset = Date.parse(`${local}:00Z`) - sample;
    const candidate = new Date(wall - offset).toISOString();
    if (toEventLocalTime(candidate, timeZone) === value)
      candidates.add(candidate);
  }
  if (candidates.size === 0)
    throw new Error(
      'Cette heure n’existe pas dans ce fuseau (changement d’heure).',
    );
  if (candidates.size > 1)
    throw new Error(
      'Cette heure apparaît deux fois lors du changement d’heure. Choisissez une heure non ambiguë.',
    );
  return [...candidates][0];
}

export function formatEventDate(value: string, timeZone: string): string {
  const local = toEventLocalTime(value, timeZone);
  const [date, time] = local.split('T');
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} à ${time}`;
}
