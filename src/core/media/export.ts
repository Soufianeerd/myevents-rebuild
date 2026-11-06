import { z } from 'zod';
import type { MediaItem } from './models';

export const exportSelectionSchema = z
  .object({
    scope: z.enum(['event', 'selection']).default('event'),
    ids: z.array(z.uuid()).max(100).default([]),
  })
  .superRefine((value, context) => {
    if (value.scope === 'selection' && !value.ids.length)
      context.addIssue({
        code: 'custom',
        message: 'Sélectionnez des souvenirs.',
      });
    if (value.scope === 'event' && value.ids.length)
      context.addIssue({ code: 'custom', message: 'Sélection ambiguë.' });
    if (new Set(value.ids).size !== value.ids.length)
      context.addIssue({ code: 'custom', message: 'Sélection dupliquée.' });
  });

export function exportName(name: string) {
  const safe =
    name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'Mon-evenement';
  return /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(safe)
    ? `Evenement-${safe}`
    : safe;
}

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
};

export function exportMediaPlan(
  items: MediaItem[],
  eventId: string,
  tenantId: string,
  input: unknown,
) {
  const selection = exportSelectionSchema.parse(input);
  const ready = items.filter(
    (item) =>
      item.eventId === eventId &&
      item.tenantId === tenantId &&
      item.status === 'ready',
  );
  if (selection.ids.some((id) => !ready.some((item) => item.id === id)))
    throw new Error(
      'Un fichier sélectionné n’est plus disponible. Rechargez vos souvenirs.',
    );
  return ready
    .filter(
      (item) => selection.scope === 'event' || selection.ids.includes(item.id),
    )
    .map((item) => {
      z.uuid().parse(item.id);
      const folder =
        item.purpose === 'design'
          ? 'creation/fichiers'
          : item.mime.startsWith('audio/')
            ? 'audios'
            : item.mime.startsWith('video/')
              ? 'videos'
              : 'photos';
      const extension = extensions[item.mime];
      if (!extension) throw new Error('Format de fichier non pris en charge.');
      return {
        item,
        path: `${folder}/${exportName(item.name.replace(/\.[^.]+$/, ''))}-${item.id}.${extension}`,
      };
    });
}
