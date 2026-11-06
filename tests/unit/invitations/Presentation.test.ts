import { it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createInvitationDocument } from '@/core/invitations/templates';
import {
  invitationAssetIds,
  calendarFile,
  countdownParts,
  directionsUrl,
} from '@/core/invitations/presentation';
import { sectionSchema } from '@/core/invitations/models';
import { parseMusicLink } from '@/core/invitations/music';
it('resolves global, section and music assets while excluding hidden section images', () => {
  const doc = createInvitationDocument(
    {
      name: 'Test',
      startAt: '2027-06-01T12:00:00.000Z',
      timezone: 'Europe/Paris',
    },
    randomUUID,
  );
  doc.backgroundMediaId = randomUUID();
  doc.music = { mediaId: randomUUID(), volume: 0.5, loop: true };
  doc.sections[0].backgroundMediaId = randomUUID();
  doc.sections[1].mediaId = randomUUID();
  doc.sections[1].visible = false;
  expect(invitationAssetIds(doc, true)).toEqual([
    doc.backgroundMediaId,
    doc.sections[0].backgroundMediaId,
    doc.music.mediaId,
  ]);
});
it('builds safe navigation links and an escaped UTC calendar', () => {
  expect(directionsUrl('Paris & Lyon')).toContain(
    'destination=Paris%20%26%20Lyon',
  );
  expect(directionsUrl('Paris', 'waze')).toBe(
    'https://waze.com/ul?q=Paris&navigate=yes',
  );
  const section = sectionSchema.parse({
    id: randomUUID(),
    type: 'calendar',
    text: 'Bonjour\nLéa',
    calendar: {
      startAt: '2027-06-01T12:00:00.000Z',
      location: 'Paris; France',
    },
  });
  const ics = calendarFile(section, 'Fête, Léa');
  expect(ics).toContain('DTSTART:20270601T120000Z');
  expect(ics).toContain('SUMMARY:Fête\\, Léa');
  expect(ics).toContain('LOCATION:Paris\\; France');
  expect(
    countdownParts(
      '2027-06-01T12:00:00.000Z',
      Date.parse('2027-06-02T12:00:00.000Z'),
    ).total,
  ).toBe(0);
});
it('accepts only canonical media identifiers, never arbitrary iframe origins', () => {
  expect(parseMusicLink('https://youtu.be/dQw4w9WgXcQ')).toEqual({
    provider: 'youtube',
    id: 'dQw4w9WgXcQ',
  });
  expect(
    parseMusicLink('https://open.spotify.com/track/0Lr4kGOYn9l83EjuK6cZFQ')
      .provider,
  ).toBe('spotify');
  for (const input of [
    'https://youtube.com.evil.invalid/watch?v=dQw4w9WgXcQ',
    'javascript:alert(1)',
    'https://user:password@youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?v=<script>',
  ])
    expect(() => parseMusicLink(input)).toThrow();
});
