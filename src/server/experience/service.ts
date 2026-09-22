import { createHash, createHmac, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { env } from '@/lib/env';
import { getCurrentAccessContext } from '@/server/auth/getCurrentAccessContext';
import { createEventContainer } from '@/server/container/events';
import type { ExperienceRepository } from '@/providers/contracts/ExperienceRepository';
import { createInvitationDocument } from '@/core/invitations/templates';
import { assertProduct } from '@/core/commerce/catalog';
import {
  invitationDocumentSchema,
  validateRsvp,
} from '@/core/invitations/models';

export async function experienceRepository(
  authenticated = true,
): Promise<ExperienceRepository> {
  if (env.APP_MODE === 'local') {
    const { LocalExperienceRepository } =
      await import('@/providers/local/LocalExperienceRepository');
    return new LocalExperienceRepository(env.LOCAL_DATA_DIR);
  }
  if (env.CONNECTED_PROVIDER !== 'neon')
    throw new Error('Cette fonctionnalité nécessite Neon.');
  const { NeonExperienceRepository } =
    await import('@/providers/neon/NeonExperienceRepository');
  const db = authenticated
    ? await (await import('@/server/neon/auth')).authenticatedNeonDatabase()
    : (await import('@/server/neon/database')).scopedNeonDatabase(null);
  return new NeonExperienceRepository(db);
}
export async function eventScope(id: unknown) {
  const eventId = z.uuid().parse(id);
  const context = await getCurrentAccessContext();
  if (context.kind !== 'user')
    throw new Error('Connectez-vous pour continuer.');
  const container = await createEventContainer();
  const event = await container.eventRepository.findById(
    eventId as never,
    context.tenantId,
  );
  if (!event) throw new Error('Événement introuvable.');
  return { event, context, repository: await experienceRepository() };
}
export function tokenFor(eventId: string, kind = 'invitation') {
  const secret =
    process.env.INVITATION_LINK_SECRET ||
    env.NEON_AUTH_COOKIE_SECRET ||
    (env.APP_MODE === 'local'
      ? 'local-development-only-invitation-secret'
      : undefined);
  if (!secret || secret.length < 32)
    throw new Error('La sécurité des liens doit être configurée.');
  return createHmac('sha256', secret)
    .update(`${kind}:${eventId}`)
    .digest('hex');
}
export function tokenHash(token: string) {
  z.string()
    .regex(/^[a-f0-9]{64}$/)
    .parse(token);
  return createHash('sha256').update(token).digest('hex');
}
export function appOrigin() {
  return env.APP_URL || 'http://localhost:3000';
}
export async function studioState(id: string) {
  const { event, context, repository } = await eventScope(id);
  const [record, products] = await Promise.all([
    repository.get(event.id, context.tenantId),
    repository.entitlements(event.id, context.tenantId),
  ]);
  return {
    event,
    record,
    document: record?.draft ?? createInvitationDocument(event, randomUUID),
    products,
    publicUrl: record?.published
      ? `${appOrigin()}/i/${tokenFor(event.id)}`
      : null,
  };
}
export async function saveInvitation(
  id: string,
  input: unknown,
  revision: unknown,
) {
  const document = invitationDocumentSchema.parse(input);
  if (JSON.stringify(document).length > 250000)
    throw new Error('Le document est trop volumineux.');
  const version = z.number().int().min(0).parse(revision);
  const { event, context, repository } = await eventScope(id);
  return repository.save(
    event.id,
    context.tenantId,
    document,
    version,
    new Date().toISOString(),
  );
}
export async function publishInvitation(id: string, revision: unknown) {
  const { event, context, repository } = await eventScope(id);
  assertProduct(
    await repository.entitlements(event.id, context.tenantId),
    'invitation',
  );
  const token = tokenFor(event.id);
  await repository.publish(
    event.id,
    context.tenantId,
    z.number().int().min(1).parse(revision),
    tokenHash(token),
    new Date().toISOString(),
  );
  return `${appOrigin()}/i/${token}`;
}
export async function publicInvitation(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  return (await experienceRepository(false)).getPublic(tokenHash(token));
}
export async function submitResponse(
  token: string,
  input: unknown,
  revision: unknown,
) {
  const doc = await publicInvitation(token);
  if (!doc) throw new Error('Cette invitation n’est plus disponible.');
  if (doc.revision !== z.number().int().parse(revision))
    throw new Error('L’invitation a changé. Rechargez la page.');
  const response = validateRsvp(doc.document, input, new Date());
  await (
    await experienceRepository(false)
  ).respond(tokenHash(token), response, doc.revision, new Date().toISOString());
}

export function businessPreviewEnabled() {
  return (
    process.env.BUSINESS_PREVIEW === 'true' &&
    process.env.VERCEL_ENV !== 'production'
  );
}
export async function activateBusinessPreview(id: string) {
  if (!businessPreviewEnabled())
    throw new Error('Le mode de démonstration est indisponible.');
  const { event, context, repository } = await eventScope(id);
  await repository.activatePreview(id, context.tenantId);
  const { mediaRepository } = await import('@/server/media/service');
  const media = await mediaRepository();
  const spaces = await media.spaces(id, context.tenantId);
  for (const kind of ['audio', 'photo_video'] as const)
    if (!spaces.some((s) => s.kind === kind))
      await media.configure(
        id,
        context.tenantId,
        kind,
        tokenHash(tokenFor(id, kind)),
        {
          enabled: true,
          collaborative: false,
          allowDownload: false,
          availableAt: new Date(
            new Date(event.endAt ?? event.startAt).getTime() + 86400000,
          ).toISOString(),
        },
      );
}
