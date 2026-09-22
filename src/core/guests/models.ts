import { z } from 'zod';
export const guestStatuses = [
  'not_invited',
  'sent',
  'opened',
  'pending',
  'yes',
  'no',
  'incomplete',
] as const;
export const guestSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(150),
  email: z.union([z.literal(''), z.email()]).default(''),
  phone: z.string().trim().max(50).default(''),
  household: z.string().trim().max(150).default(''),
  group: z.string().trim().max(100).default(''),
  table: z.string().trim().max(100).default(''),
  status: z.enum(guestStatuses).default('not_invited'),
  maxCompanions: z.number().int().min(0).max(50).default(0),
  notes: z.string().max(4000).default(''),
});
export const guestBookSchema = z
  .object({ guests: z.array(guestSchema).max(5000).default([]) })
  .refine(
    (book) => new Set(book.guests.map((g) => g.id)).size === book.guests.length,
    'Identifiants invités dupliqués.',
  );
export type Guest = z.infer<typeof guestSchema>;
export type GuestBook = z.infer<typeof guestBookSchema>;
export interface GuestBookRecord {
  eventId: string;
  tenantId: string;
  document: GuestBook;
  revision: number;
  updatedAt: string;
}
export function mergeGuestImport(book: GuestBook, rows: Guest[]) {
  const seen = new Set(
    book.guests.map((g) => g.email.trim().toLowerCase()).filter(Boolean),
  );
  const added: Guest[] = [];
  let skipped = 0;
  for (const guest of rows) {
    const email = guest.email.trim().toLowerCase();
    if (email && seen.has(email)) {
      skipped++;
      continue;
    }
    if (email) seen.add(email);
    added.push(guest);
  }
  return {
    document: guestBookSchema.parse({ guests: [...book.guests, ...added] }),
    added: added.length,
    skipped,
  };
}
export function parseCsv(input: string): string[][] {
  if (input.length > 2000000) throw new Error('Le fichier dépasse 2 Mo.');
  const text = input.replace(/^\uFEFF/, '');
  const firstLine = text.split(/\r?\n/)[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [],
    cell = '',
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted) {
        quoted = false;
      } else if (cell === '') {
        quoted = true;
      } else throw new Error('Guillemets CSV invalides.');
    } else if (c === delimiter && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
    if (cell.length > 10000 || row.length > 50 || rows.length > 5000)
      throw new Error('Le fichier contient trop de données.');
  }
  if (quoted) throw new Error('Guillemets CSV non fermés.');
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}
export function csvCell(value: unknown) {
  const text = String(value ?? '');
  return `"${(/^[\s]*[=+@-]/.test(text) ? "'" : '') + text.replaceAll('"', '""')}"`;
}
export function guestsCsv(guests: Guest[]) {
  const keys = [
    'name',
    'email',
    'phone',
    'household',
    'group',
    'table',
    'status',
    'maxCompanions',
    'notes',
  ] as const;
  return (
    '\uFEFF' +
    [
      keys.join(';'),
      ...guests.map((g) => keys.map((k) => csvCell(g[k])).join(';')),
    ].join('\r\n')
  );
}
