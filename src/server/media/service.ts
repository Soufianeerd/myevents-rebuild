import { randomBytes, randomUUID } from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import { z } from 'zod';
import { env } from '@/lib/env';
import {
  eventScope,
  tokenFor,
  tokenHash,
  appOrigin,
} from '@/server/experience/service';
import {
  mediaKindSchema,
  spaceSchema,
  validateUpload,
  compatibleMime,
} from '@/core/media/models';
import type { MediaRepository } from '@/providers/contracts/MediaRepository';
import type { MediaStorage } from '@/providers/contracts/MediaStorage';
export async function mediaRepository(
  authenticated = true,
): Promise<MediaRepository> {
  if (env.APP_MODE === 'local') {
    const { LocalMediaRepository } =
      await import('@/providers/local/LocalMediaRepository');
    return new LocalMediaRepository(env.LOCAL_DATA_DIR);
  }
  if (env.CONNECTED_PROVIDER !== 'neon') throw new Error('Neon requis.');
  const { NeonMediaRepository } =
    await import('@/providers/neon/NeonMediaRepository');
  const db = authenticated
    ? await (await import('@/server/neon/auth')).authenticatedNeonDatabase()
    : (await import('@/server/neon/database')).scopedNeonDatabase(null);
  return new NeonMediaRepository(db);
}
export async function mediaStorage(): Promise<MediaStorage> {
  if (env.APP_MODE === 'local') {
    const { LocalMediaStorage } =
      await import('@/providers/local/LocalMediaStorage');
    return new LocalMediaStorage(
      env.LOCAL_DATA_DIR,
      tokenFor('local-storage'),
      appOrigin(),
    );
  }
  const config = z
    .object({
      endpoint: z.url(),
      region: z.string().min(1),
      accessKeyId: z.string().min(1),
      secretAccessKey: z.string().min(1),
      bucket: z.string().min(1),
    })
    .parse({
      endpoint: process.env.NEON_STORAGE_ENDPOINT,
      region: process.env.NEON_STORAGE_REGION,
      accessKeyId: process.env.NEON_STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEON_STORAGE_SECRET_ACCESS_KEY,
      bucket: process.env.NEON_STORAGE_BUCKET,
    });
  const { NeonMediaStorage } =
    await import('@/providers/storage/NeonMediaStorage');
  return new NeonMediaStorage(config.bucket, config);
}
export async function configureSpace(
  id: string,
  kind: unknown,
  input: unknown,
) {
  const { event, context } = await eventScope(id);
  const type = mediaKindSchema.parse(kind);
  await (
    await mediaRepository()
  ).configure(
    event.id,
    context.tenantId,
    type,
    tokenHash(tokenFor(event.id, type)),
    spaceSchema.parse(input),
  );
}
export async function beginUpload(token: string, input: unknown) {
  const repo = await mediaRepository(false);
  const hash = tokenHash(token);
  const space = await repo.publicSpace(hash);
  if (!space) throw new Error('Cet espace est indisponible.');
  const data = validateUpload(space.kind, input);
  const id = randomUUID(),
    secret = randomBytes(32).toString('hex');
  const key = await repo.reserve(hash, id, tokenHash(secret), data);
  try {
    return {
      id,
      secret,
      ...(await (await mediaStorage()).createUpload(key, data.mime, data.size)),
    };
  } catch (error) {
    await repo.cancel(id, tokenHash(secret));
    throw error;
  }
}
export async function finishUpload(id: string, secret: string) {
  z.uuid().parse(id);
  const hash = tokenHash(secret);
  const repo = await mediaRepository(false);
  const item = await repo.pending(id, hash);
  if (!item) throw new Error('Le dépôt a expiré.');
  const storage = await mediaStorage();
  const finalKey = `${item.tenantId}/${item.eventId}/${randomUUID()}`;
  try {
    await storage.promote(item.objectKey, finalKey);
    const actual = await storage.inspect(finalKey);
    const detected = await fileTypeFromBuffer(actual.prefix);
    if (
      actual.size !== item.size ||
      !detected ||
      !compatibleMime(item.mime, detected.mime)
    )
      throw new Error('Le contenu ne correspond pas au format annoncé.');
    await repo.complete(id, hash, actual.size, item.mime, finalKey);
  } catch (error) {
    await storage.delete(finalKey);
    throw error;
  }
  // The signed quarantine URL may still be replayed until expiry; it never points to the immutable published object.
  await storage.delete(`${item.objectKey}.upload`).catch(() => undefined);
}
export async function ownerMedia(id: string) {
  const { event, context, repository } = await eventScope(id);
  const repo = await mediaRepository();
  const [spaces, items, products] = await Promise.all([
    repo.spaces(id, context.tenantId),
    repo.list(id, context.tenantId),
    repository.entitlements(id, context.tenantId),
  ]);
  const storage = items.some((i) => i.status === 'ready')
    ? await mediaStorage()
    : null;
  return {
    event,
    spaces,
    products,
    usedBytes: items.reduce((sum, item) => sum + item.size, 0),
    items: await Promise.all(
      items
        .filter((i) => i.purpose !== 'design')
        .map(async (i) => ({
          id: i.id,
          name: i.name,
          author: i.author,
          mime: i.mime,
          size: i.size,
          kind: i.kind,
          status: i.status,
          hidden: i.hidden,
          favorite: i.favorite,
          createdAt: i.createdAt,
          url:
            i.status === 'ready' ? await storage!.readUrl(i.objectKey) : null,
        })),
    ),
    links: Object.fromEntries(
      spaces.map((s) => [
        s.kind,
        `${appOrigin()}/souvenirs/${tokenFor(id, s.kind)}`,
      ]),
    ),
  };
}
export async function guestMedia(token: string) {
  const repo = await mediaRepository(false);
  const hash = tokenHash(token);
  const space = await repo.publicSpace(hash);
  if (!space) return null;
  const items = await repo.shared(hash);
  const storage = items.length ? await mediaStorage() : null;
  return {
    space,
    items: await Promise.all(
      items.map(async (i) => ({
        id: i.id,
        name: i.name,
        author: i.author,
        mime: i.mime,
        url: await storage!.readUrl(i.objectKey),
        download: space.allowDownload
          ? await storage!.readUrl(i.objectKey, i.name)
          : null,
      })),
    ),
  };
}
export async function moderateMedia(
  eventId: string,
  id: string,
  input: unknown,
) {
  z.uuid().parse(id);
  const patch = z
    .object({
      name: z.string().trim().min(1).max(180).optional(),
      hidden: z.boolean().optional(),
      favorite: z.boolean().optional(),
      status: z.literal('deleted').optional(),
    })
    .strict()
    .parse(input);
  const { context } = await eventScope(eventId);
  const repo = await mediaRepository();
  const item = (await repo.list(eventId, context.tenantId)).find(
    (i) => i.id === id,
  );
  if (!item) throw new Error('Fichier introuvable.');
  if (patch.status === 'deleted') {
    const invitation = await (
      await import('@/server/experience/service')
    ).experienceRepository();
    const record = await invitation.get(eventId, context.tenantId);
    if (
      record?.published?.sections.some(
        (s) => s.visible && s.type === 'image' && s.mediaId === id,
      )
    )
      throw new Error(
        'Retirez cette photo de l’invitation publiée avant de la supprimer.',
      );
  }
  await repo.moderate(id, eventId, context.tenantId, patch);
  if (patch.status === 'deleted') {
    const storage = await mediaStorage();
    await storage.delete(item.objectKey);
    await storage.delete(`${item.objectKey}.upload`);
  }
}

export async function beginDesignImage(id: string, input: unknown) {
  const { context, repository: experience } = await eventScope(id);
  const products = await experience.entitlements(id, context.tenantId);
  if (!products.includes('invitation') && !products.includes('thank_you'))
    throw new Error(
      'Activez votre invitation ou vos cartes avant d’importer vos images.',
    );
  const data = validateUpload('photo_video', input);
  if (!data.mime.startsWith('image/'))
    throw new Error('Choisissez une image JPEG, PNG, WebP ou GIF.');
  const media = await mediaRepository(),
    assetId = randomUUID(),
    secret = randomBytes(32).toString('hex');
  const key = await media.reserveDesign(
    id,
    context.tenantId,
    assetId,
    tokenHash(secret),
    data,
  );
  try {
    return {
      id: assetId,
      secret,
      ...(await (await mediaStorage()).createUpload(key, data.mime, data.size)),
    };
  } catch (error) {
    await media.cancel(assetId, tokenHash(secret));
    throw error;
  }
}
export async function designImages(id: string) {
  const { context } = await eventScope(id);
  return (await (await mediaRepository()).list(id, context.tenantId))
    .filter((m) => m.status === 'ready' && m.mime.startsWith('image/'))
    .map((m) => ({
      id: m.id,
      name: m.name,
      url: `/events/${id}/assets/${m.id}`,
    }));
}
export async function ownerImageUrl(id: string, assetId: string) {
  z.uuid().parse(assetId);
  const { context } = await eventScope(id);
  const item = (
    await (await mediaRepository()).list(id, context.tenantId)
  ).find(
    (m) =>
      m.id === assetId && m.status === 'ready' && m.mime.startsWith('image/'),
  );
  if (!item) return null;
  return (await mediaStorage()).readUrl(item.objectKey);
}
export async function invitationImageUrl(token: string, assetId: string) {
  z.uuid().parse(assetId);
  const key = await (
    await mediaRepository(false)
  ).publicInvitationImage(tokenHash(token), assetId);
  return key ? (await mediaStorage()).readUrl(key) : null;
}
