import { it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  guestSchema,
  mapGuestRows,
  guestBookSchema,
  parseCsv,
  guestsCsv,
  mergeGuestImport,
} from '@/core/guests/models';
it('parses quoted delimiters, multiline notes and escaped quotes', () => {
  expect(
    parseCsv('name;notes\r\n"Alice; Martin";"Deux lignes\navec ""citation"""'),
  ).toEqual([
    ['name', 'notes'],
    ['Alice; Martin', 'Deux lignes\navec "citation"'],
  ]);
  expect(() => parseCsv('name\n"Alice')).toThrow();
  expect(() => parseCsv('x'.repeat(2000001))).toThrow();
});
it('merges imports without duplicate emails and keeps distinct guests without an email', () => {
  const original = guestSchema.parse({
    id: randomUUID(),
    name: 'Alice',
    email: 'Alice@example.com',
  });
  const rows = [
    guestSchema.parse({
      id: randomUUID(),
      name: 'Alice bis',
      email: 'alice@example.com',
    }),
    guestSchema.parse({ id: randomUUID(), name: 'Bob' }),
    guestSchema.parse({ id: randomUUID(), name: 'Claire' }),
  ];
  const result = mergeGuestImport({ guests: [original] }, rows);
  expect(result.added).toBe(2);
  expect(result.skipped).toBe(1);
  expect(result.document.guests).toHaveLength(3);
  expect(() =>
    guestBookSchema.parse({ guests: [original, original] }),
  ).toThrow();
});
it('exports quoted Unicode CSV with spreadsheet formula protection', () => {
  const guest = guestSchema.parse({
    id: randomUUID(),
    name: 'Élodie',
    notes: '=HYPERLINK("url")',
  });
  const rows = parseCsv(guestsCsv([guest]));
  expect(rows[1][0]).toBe('Élodie');
  expect(rows[1][8]).toBe('\'=HYPERLINK("url")');
});

it('imports exported statuses and companion limits without silently resetting them', () => {
  const guest = guestSchema.parse({
    id: randomUUID(),
    name: 'Alice',
    status: 'yes',
    maxCompanions: 3,
  });
  const rows = parseCsv(guestsCsv([guest]));
  const mapping = Object.fromEntries(
    rows[0].map((key, index) => [key, String(index)]),
  );
  expect(mapGuestRows(rows, mapping, randomUUID)[0]).toMatchObject({
    name: 'Alice',
    status: 'yes',
    maxCompanions: 3,
  });
  rows[1][7] = '-1';
  expect(() => mapGuestRows(rows, mapping, randomUUID)).toThrow('Ligne 2');
});
