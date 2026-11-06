import { guestBookSchema, guestSchema, type GuestBook } from './models';
import { replyFor, type ReceivedResponse } from './responses';
import type { RsvpResponse } from '@/core/invitations/models';

export function validateResponseLinks(
  book: GuestBook,
  responses: ReceivedResponse[],
) {
  guestBookSchema.parse(book);
  for (const guest of book.guests) {
    if (!guest.responseId) continue;
    const response = responses.find((row) => row.id === guest.responseId);
    if (!response || response.guestId)
      throw new Error('Cette réponse ne peut pas être rattachée à ce contact.');
  }
}

export function reconcileResponse(
  book: GuestBook,
  responses: RsvpResponse[],
  responseId: string,
  guestId: string | null,
  newId: () => string,
): GuestBook {
  const response = responses.find((row) => row.id === responseId);
  if (
    !response ||
    response.guestId ||
    book.guests.some((guest) => guest.responseId === response.id)
  )
    throw new Error('Cette réponse est introuvable ou déjà rattachée.');
  const guest = guestId
    ? book.guests.find((row) => row.id === guestId)
    : undefined;
  if (guestId && (!guest || replyFor(guest, responses)))
    throw new Error('Choisissez un contact sans réponse déjà rattachée.');
  const contact = guest
    ? {
        ...guest,
        responseId: response.id,
        household:
          guest.household ||
          (guest.householdAssigned ? '' : (response.household ?? '')),
      }
    : guestSchema.parse({
        id: newId(),
        name: response.name,
        email: response.email,
        household: response.household ?? '',
        responseId: response.id,
      });
  const result = guestBookSchema.parse({
    guests: [...book.guests.filter((row) => row.id !== contact.id), contact],
  });
  validateResponseLinks(result, responses);
  return result;
}
