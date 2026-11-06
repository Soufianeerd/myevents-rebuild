import type { Guest, GuestBook } from './models';
import type { RsvpField, RsvpResponse } from '@/core/invitations/models';
import { csvCell } from './models';
export type ReceivedResponse = Pick<RsvpResponse, 'guestId' | 'presence'> &
  Partial<
    Pick<RsvpResponse, 'id' | 'household' | 'answers' | 'answerLabels'>
  > & { createdAt?: string };
export function replyFor(guest: Guest, responses: ReceivedResponse[]) {
  return responses
    .filter(
      (response) =>
        response.guestId === guest.id ||
        (!!guest.responseId && response.id === guest.responseId),
    )
    .sort(
      (a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? '') ||
        Number(!!b.guestId) - Number(!!a.guestId),
    )[0];
}
export function nonResponders(guests: Guest[], responses: ReceivedResponse[]) {
  return guests.filter(
    (guest) =>
      !replyFor(guest, responses) &&
      !['yes', 'no', 'not_invited'].includes(guest.status),
  );
}
export function withHouseholds(
  book: GuestBook,
  responses: ReceivedResponse[],
): GuestBook {
  return {
    guests: book.guests.map((guest) => ({
      ...guest,
      household: guest.householdAssigned
        ? guest.household
        : guest.household || replyFor(guest, responses)?.household || '',
    })),
  };
}
export function responseColumns(
  fields: RsvpField[],
  responses: ReceivedResponse[],
) {
  const columns = new Map(
    fields.map((field) => [field.id, { id: field.id, label: field.label }]),
  );
  for (const response of responses)
    for (const id of Object.keys(response.answers ?? {}))
      if (!columns.has(id))
        columns.set(id, {
          id,
          label: response.answerLabels?.[id] ?? `Ancienne question (${id})`,
        });
  return [...columns.values()];
}

export function responsesCsv(
  fields: RsvpField[],
  rows: Array<RsvpResponse & { createdAt: string }>,
) {
  const columns = responseColumns(fields, rows);
  return (
    '\uFEFF' +
    [
      [
        'Nom',
        'E-mail',
        'Présence',
        'Accompagnants',
        'Foyer',
        ...columns.map((field) => field.label),
        'Date',
      ],
      ...rows.map((row) => [
        row.name,
        row.email,
        row.presence === 'yes' ? 'Présent' : 'Absent',
        row.companions ?? 0,
        row.household ?? '',
        ...columns.map((field) => row.answers[field.id] ?? ''),
        row.createdAt,
      ]),
    ]
      .map((row) =>
        row
          .map((value) =>
            csvCell(Array.isArray(value) ? value.join(', ') : value),
          )
          .join(';'),
      )
      .join('\r\n')
  );
}
