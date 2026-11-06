import { z } from 'zod';
import { guestBookSchema, type Guest, type GuestBook } from './models';
import { replyFor, type ReceivedResponse } from './responses';

export type CollectionKind = 'household' | 'group';
export function collectionKey(label: string) {
  return label
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('fr');
}
export function guestCollections(
  guests: Guest[],
  responses: ReceivedResponse[],
  kind: CollectionKind,
) {
  const collections = new Map<
    string,
    {
      key: string;
      name: string;
      members: Guest[];
      yes: number;
      no: number;
      pending: number;
    }
  >();
  for (const guest of guests) {
    const key = collectionKey(guest[kind]);
    if (!key) continue;
    const collection = collections.get(key) ?? {
      key,
      name: guest[kind].trim(),
      members: [],
      yes: 0,
      no: 0,
      pending: 0,
    };
    collection.members.push(guest);
    const response = replyFor(guest, responses);
    collection[response?.presence ?? 'pending']++;
    collections.set(key, collection);
  }
  return [...collections.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr'),
  );
}
export function assignCollection(
  book: GuestBook,
  ids: string[],
  kind: CollectionKind,
  name: string,
): GuestBook {
  z.enum(['household', 'group']).parse(kind);
  const selection = new Set(z.array(z.uuid()).min(1).max(5000).parse(ids));
  const label = z
    .string()
    .trim()
    .max(kind === 'household' ? 150 : 100)
    .parse(name)
    .replace(/\s+/g, ' ');
  if (
    [...selection].some((id) => !book.guests.some((guest) => guest.id === id))
  )
    throw new Error('La sélection contient un invité introuvable.');
  return guestBookSchema.parse({
    guests: book.guests.map((guest) =>
      selection.has(guest.id)
        ? {
            ...guest,
            [kind]: label,
            ...(kind === 'household' ? { householdAssigned: true } : {}),
          }
        : guest,
    ),
  });
}
export function renameCollection(
  book: GuestBook,
  kind: CollectionKind,
  from: string,
  to: string,
): GuestBook {
  z.string().trim().min(1).parse(to);
  return assignCollection(
    book,
    book.guests
      .filter((guest) => collectionKey(guest[kind]) === collectionKey(from))
      .map((guest) => guest.id),
    kind,
    to,
  );
}
