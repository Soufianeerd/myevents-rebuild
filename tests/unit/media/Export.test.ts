import { expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { exportMediaPlan, exportName } from '@/core/media/export';
import type { MediaItem } from '@/core/media/models';
import { responsesCsv } from '@/core/guests/responses';

const tenantId = randomUUID(),
  eventId = randomUUID();
const item = (patch: Partial<MediaItem> = {}): MediaItem => ({
  id: randomUUID(),
  tenantId,
  eventId,
  kind: 'photo_video',
  name: '../évenement/CON.jpg',
  objectKey: 'private',
  mime: 'image/jpeg',
  size: 20,
  status: 'ready',
  hidden: true,
  favorite: false,
  author: 'Camille',
  createdAt: '2026-09-30T00:00:00Z',
  ...patch,
});
it('exports only completed files belonging to the requested event and tenant, including private audio', () => {
  const ready = item(),
    audio = item({ kind: 'audio', mime: 'audio/wav' });
  const plan = exportMediaPlan(
    [
      ready,
      audio,
      item({ status: 'deleted' }),
      item({ status: 'pending' }),
      item({ tenantId: randomUUID() }),
      item({ eventId: randomUUID() }),
    ],
    eventId,
    tenantId,
    {},
  );
  expect(plan.map(({ item }) => item.id)).toEqual([ready.id, audio.id]);
  expect(plan[1].path).toMatch(/^audios\/.+\.wav$/);
});
it('normalizes traversal and executable extensions and keeps duplicate names distinct', () => {
  const items = [
    item(),
    item(),
    item({ name: 'C:\\secret.exe', purpose: 'design' }),
  ];
  const paths = exportMediaPlan(items, eventId, tenantId, {}).map(
    ({ path }) => path,
  );
  expect(new Set(paths).size).toBe(3);
  for (const path of paths) {
    expect(path).not.toMatch(/\.\.|\\|:/);
    expect(path).toMatch(/\.jpg$/);
  }
  expect(paths[2]).toMatch(/^creation\/fichiers\//);
  expect(exportName('../../')).toBe('Mon-evenement');
  expect(exportName('NUL')).toBe('Evenement-NUL');
});
it('rejects invalid, duplicated, pending, deleted and out-of-scope selections', () => {
  const ready = item(),
    pending = item({ status: 'pending' });
  for (const input of [
    { scope: 'selection' },
    { scope: 'unknown' },
    { ids: [ready.id] },
    { scope: 'selection', ids: [ready.id, ready.id] },
    { scope: 'selection', ids: [pending.id] },
    { scope: 'selection', ids: [randomUUID()] },
    { scope: 'selection', ids: Array.from({ length: 101 }, randomUUID) },
  ])
    expect(() =>
      exportMediaPlan([ready, pending], eventId, tenantId, input),
    ).toThrow();
  expect(
    exportMediaPlan([ready, item()], eventId, tenantId, {
      scope: 'selection',
      ids: [ready.id],
    }),
  ).toHaveLength(1);
});
it('keeps old RSVP labels, multi-answer data and neutralizes spreadsheet formulas', () => {
  const csv = responsesCsv(
    [],
    [
      {
        id: randomUUID(),
        name: '=HYPERLINK("secret")',
        email: 'test@example.invalid',
        presence: 'no',
        answers: { old: ['+formula', 'Sans gluten'] },
        answerLabels: { old: 'Menu supprimé' },
        consent: true,
        createdAt: '2026-09-30T00:00:00Z',
      },
    ],
  );
  expect(csv).toContain('Menu supprimé');
  expect(csv).toContain("'=HYPERLINK");
  expect(csv).toContain("'+formula, Sans gluten");
  expect(csv).toContain('Absent');
});
