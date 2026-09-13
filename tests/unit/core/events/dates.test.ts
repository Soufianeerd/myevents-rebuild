import { describe, expect, it } from 'vitest';
import { toEventInstant, toEventLocalTime } from '@/core/events/dates';
import { eventBasicsSchema } from '@/core/events/validation';

describe('Event time semantics', () => {
  it.each([
    ['2026-01-10T12:00', 'Europe/Paris', '2026-01-10T11:00:00.000Z'],
    ['2026-07-10T12:00', 'Europe/Paris', '2026-07-10T10:00:00.000Z'],
    ['2026-07-10T12:00', 'Africa/Casablanca', '2026-07-10T11:00:00.000Z'],
    ['2026-07-10T12:00', 'Asia/Kathmandu', '2026-07-10T06:15:00.000Z'],
  ])(
    'converts %s in %s independently of the machine zone',
    (local, zone, instant) => {
      expect(toEventInstant(local, zone)).toBe(instant);
      expect(toEventLocalTime(instant, zone)).toBe(local);
    },
  );
  it.each([
    '2026-03-29T02:30',
    '2026-10-25T02:30',
    '2026-02-30T12:00',
    '2026-02-30T12:00:00Z',
  ])('rejects skipped, ambiguous or invalid wall times: %s', (value) => {
    expect(() => toEventInstant(value, 'Europe/Paris')).toThrow();
  });
  it('rejects unknown timezones and an end before the start', () => {
    expect(() => toEventInstant('2026-01-10T12:00', 'Not/AZone')).toThrow();
    expect(
      eventBasicsSchema.safeParse({
        type: 'wedding',
        name: 'Test',
        startAt: '2026-01-10T12:00',
        endAt: '2026-01-10T11:00',
        timezone: 'Europe/Paris',
        defaultLanguage: 'fr',
      }).success,
    ).toBe(false);
  });
});
