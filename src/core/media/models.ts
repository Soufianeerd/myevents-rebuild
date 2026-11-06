import { z } from 'zod';
export const mediaKindSchema = z.enum(['audio', 'photo_video']);
export type MediaKind = z.infer<typeof mediaKindSchema>;
export const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/webm',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
] as const;
export const uploadSchema = z.object({
  name: z.string().trim().min(1).max(180),
  author: z.string().trim().max(100).default(''),
  mime: z.enum(allowedMimeTypes),
  size: z
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024),
  consent: z.literal(true),
});
export type UploadRequest = z.infer<typeof uploadSchema>;
export function validateUpload(kind: MediaKind, value: unknown) {
  const input = uploadSchema.parse(value);
  if (kind === 'audio' && !input.mime.startsWith('audio/'))
    throw new Error('Choisissez un fichier audio.');
  if (kind === 'photo_video' && !/^(image|video)\//.test(input.mime))
    throw new Error('Choisissez une photo ou une vidéo.');
  if (input.mime.startsWith('image/') && input.size > 20 * 1024 * 1024)
    throw new Error('Les photos sont limitées à 20 Mo.');
  return input;
}
export interface MediaItem {
  id: string;
  eventId: string;
  tenantId: string;
  kind: MediaKind;
  purpose?: 'guest' | 'design';
  objectKey: string;
  name: string;
  author: string;
  mime: string;
  size: number;
  status: 'pending' | 'ready' | 'deleted';
  hidden: boolean;
  favorite: boolean;
  createdAt: string;
}
export interface MediaSpace {
  eventId: string;
  kind: MediaKind;
  enabled: boolean;
  collaborative: boolean;
  availableAt: string;
  allowDownload: boolean;
}
export const spaceSchema = z.object({
  enabled: z.boolean(),
  collaborative: z.boolean(),
  availableAt: z.iso.datetime(),
  allowDownload: z.boolean(),
});
export function validateSpace(kind: MediaKind, value: unknown) {
  const config = spaceSchema.parse(value);
  if (kind === 'audio' && (config.collaborative || config.allowDownload))
    throw new Error('Le livre audio reste privé pour l’organisateur.');
  return config;
}
// Older saved audio settings must never grant access to guest recordings.
export function privateAudioSpace<
  T extends Pick<MediaSpace, 'kind' | 'collaborative' | 'allowDownload'>,
>(space: T): T {
  return space.kind === 'audio'
    ? { ...space, collaborative: false, allowDownload: false }
    : space;
}
export function isGalleryOpen(
  space: Pick<MediaSpace, 'kind' | 'collaborative' | 'availableAt'>,
  now: number,
) {
  return (
    space.kind === 'photo_video' &&
    space.collaborative &&
    new Date(space.availableAt).getTime() <= now
  );
}
export function compatibleMime(declared: string, detected: string) {
  if (declared === detected) return true;
  return (
    (declared === 'audio/webm' && detected === 'video/webm') ||
    (declared === 'audio/mp4' &&
      ['video/mp4', 'audio/x-m4a'].includes(detected)) ||
    (['audio/wav', 'audio/x-wav'].includes(declared) &&
      detected === 'audio/wav')
  );
}

export interface MediaUsage {
  photos: number;
  videos: number;
  audio: number;
  studio: number;
  pending: number;
  total: number;
  limit: number;
}
export function summarizeMediaUsage(
  items: Array<Pick<MediaItem, 'size' | 'mime' | 'purpose' | 'status'>>,
): MediaUsage {
  const result: MediaUsage = {
    photos: 0,
    videos: 0,
    audio: 0,
    studio: 0,
    pending: 0,
    total: 0,
    limit: 3000000000,
  };
  for (const item of items) {
    if (item.status === 'deleted') continue;
    result.total += item.size;
    if (item.status === 'pending') result.pending += item.size;
    const category =
      item.purpose === 'design'
        ? 'studio'
        : item.mime.startsWith('audio/')
          ? 'audio'
          : item.mime.startsWith('video/')
            ? 'videos'
            : 'photos';
    result[category] += item.size;
  }
  return result;
}
export function storageAlert(usage: Pick<MediaUsage, 'total' | 'limit'>) {
  const percent = usage.limit
    ? Math.floor((usage.total * 100) / usage.limit)
    : 100;
  return {
    percent: Math.min(100, percent),
    level:
      percent >= 100
        ? 'full'
        : percent >= 90
          ? 'critical'
          : percent >= 75
            ? 'warning'
            : 'normal',
  } as const;
}
