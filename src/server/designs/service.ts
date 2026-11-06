import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import QRCode from 'qrcode';
import { env } from '@/lib/env';
import {
  eventScope,
  tokenFor,
  tokenHash,
  appOrigin,
} from '@/server/experience/service';
import { mediaRepository } from '@/server/media/service';
import {
  designSchema,
  newThankYou,
  validateDesignRights,
} from '@/core/designs/models';
import type { DesignRepository } from '@/providers/contracts/DesignRepository';
export async function designRepository(): Promise<DesignRepository> {
  if (env.APP_MODE === 'local') {
    const { LocalDesignRepository } =
      await import('@/providers/local/LocalDesignRepository');
    return new LocalDesignRepository(env.LOCAL_DATA_DIR);
  }
  if (env.CONNECTED_PROVIDER !== 'neon') throw new Error('Neon requis.');
  const { NeonDesignRepository } =
    await import('@/providers/neon/NeonDesignRepository');
  return new NeonDesignRepository(
    await (await import('@/server/neon/auth')).authenticatedNeonDatabase(),
  );
}
const repository = designRepository;
export async function designState(id: string) {
  const { event, context, repository: experience } = await eventScope(id);
  const [record, orders, media, invitation, requests] = await Promise.all([
    (await repository()).get(id, context.tenantId),
    experience.entitlements(id, context.tenantId),
    (await mediaRepository()).list(id, context.tenantId),
    experience.get(id, context.tenantId),
    (await repository()).requests(id, context.tenantId),
  ]);
  const products = orders;
  const images = media.filter(
    (m) => m.status === 'ready' && m.mime.startsWith('image/'),
  );
  const assets: Record<string, string> = Object.fromEntries(
    images.map((m) => [m.id, `/events/${id}/assets/${m.id}`]),
  );
  for (const kind of ['audio', 'photo_video'] as const)
    if (products.includes(kind))
      assets[kind] = await QRCode.toDataURL(
        `${appOrigin()}/souvenirs/${tokenFor(id, kind)}`,
        { width: 600, margin: 4 },
      );
  return {
    requests,
    invitationTheme: invitation
      ? {
          background: invitation.draft.background,
          font: (
            {
              editorial: 'serif',
              script: 'cursive',
              sans: 'sans-serif',
            } as const
          )[invitation.draft.font],
          color:
            invitation.draft.sections.find(
              (section) => section.type === 'title',
            )?.style.color ?? '#641d2b',
        }
      : null,
    document: record?.document ?? newThankYou(event.name, randomUUID),
    revision: record?.revision ?? 0,
    products,
    assets,
    imageChoices: images.map((i) => ({ id: i.id, name: i.name })),
  };
}

export async function requestMaterial(id: string, input: unknown) {
  const { materialRequestInputSchema } =
    await import('@/core/designs/requests');
  const request = materialRequestInputSchema.parse(input);
  const { context } = await eventScope(id);
  const repo = await repository();
  const record = await repo.get(id, context.tenantId);
  if (!record || record.revision !== request.revision)
    throw new Error(
      'La carte a changé. Enregistrez-la et vérifiez son aperçu avant de demander une impression.',
    );
  return repo.requestMaterial({
    ...request,
    eventId: id,
    tenantId: context.tenantId,
    document: record.document,
    status: 'requested',
    createdAt: new Date().toISOString(),
  });
}
export async function saveDesign(
  id: string,
  input: unknown,
  revision: unknown,
) {
  const document = designSchema.parse(input);
  if (JSON.stringify(document).length > 250000)
    throw new Error('La carte est trop volumineuse.');
  const { event, context, repository: experience } = await eventScope(id);
  const [orders, media] = await Promise.all([
    experience.entitlements(id, context.tenantId),
    (await mediaRepository()).list(id, context.tenantId),
  ]);
  validateDesignRights(
    document,
    orders,
    media
      .filter((m) => m.status === 'ready' && m.mime.startsWith('image/'))
      .map((m) => m.id),
  );
  const mediaRepo = await mediaRepository();
  const spaces = await mediaRepo.spaces(id, context.tenantId);
  for (const kind of new Set(
    document.sides.flatMap((s) =>
      s.elements.filter((e) => e.type === 'qr').map((e) => e.qr),
    ),
  )) {
    const space = spaces.find((s) => s.kind === kind);
    if (space && !space.enabled)
      throw new Error(
        'Activez cet espace souvenirs avant de placer son QR sur la carte.',
      );
    if (!space)
      await mediaRepo.configure(
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
  return (await repository()).save(
    id,
    context.tenantId,
    document,
    z.number().int().min(0).parse(revision),
  );
}

export async function orderPrint(id: string, input: unknown) {
  const { printRequestSchema, testMaterials, quotePrint } =
    await import('@/core/designs/printing');
  const request = printRequestSchema.parse(input);
  const state = await designState(id);
  if (state.revision < 1)
    throw new Error('Enregistrez votre carte avant de commander.');
  const material = testMaterials.find((m) => m.id === request.materialId);
  if (!material) throw new Error('Support indisponible.');
  const quote = quotePrint(state.document, material, request);
  const { checkoutOffer } = await import('@/server/payments/stripe');
  return checkoutOffer(id, {
    id: `impression-${material.id}`,
    name: `${request.quantity} cartes de remerciement — ${material.name}`,
    products: ['thank_you'],
    amount: quote.total,
    currency: 'eur',
    active: true,
    testOnly: true,
    print: {
      document: state.document,
      revision: state.revision,
      material,
      request,
      ...quote,
    },
  });
}

export async function exportDesignPdf(id: string, expectedRevision: unknown) {
  const { context, repository: experience } = await eventScope(id);
  const record = await (await repository()).get(id, context.tenantId);
  if (
    !record ||
    record.revision !==
      z.coerce.number().int().positive().parse(expectedRevision)
  )
    throw new Error(
      'Enregistrez la carte puis rechargez-la avant de télécharger le PDF.',
    );
  const products = await experience.entitlements(id, context.tenantId);
  if (!products.includes('thank_you'))
    throw new Error(
      'Activez les cartes de remerciement pour télécharger votre création.',
    );
  const media = (
    await (await mediaRepository()).list(id, context.tenantId)
  ).filter((item) => item.status === 'ready' && item.mime.startsWith('image/'));
  validateDesignRights(
    record.document,
    products,
    media.map((item) => item.id),
  );
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const { mediaStorage } = await import('@/server/media/service');
  const assets: Record<string, Uint8Array> = {};
  const spaces = await (await mediaRepository()).spaces(id, context.tenantId);
  let bytes = 0;
  for (const element of record.document.sides.flatMap(
    (side) => side.elements,
  )) {
    if (element.type === 'qr') {
      if (!spaces.some((space) => space.kind === element.qr && space.enabled))
        throw new Error(
          'Activez l’espace souvenirs avant de télécharger son QR.',
        );
      assets[element.qr] = await QRCode.toBuffer(
        `${appOrigin()}/souvenirs/${tokenFor(id, element.qr)}`,
        { width: 1200, margin: 4 },
      );
    } else if (
      element.type === 'image' &&
      element.image &&
      !assets[element.image]
    ) {
      if (element.image.startsWith('/images/editorial/')) {
        assets[element.image] = new Uint8Array(
          await readFile(join(process.cwd(), 'public', element.image)),
        );
      } else {
        const item = media.find((item) => item.id === element.image);
        if (!item)
          throw new Error('Une image de la carte n’est plus disponible.');
        bytes += item.size;
        if (bytes > 100 * 1024 * 1024)
          throw new Error(
            'Réduisez la taille des images de votre carte avant de l’exporter.',
          );
        assets[element.image] = await (
          await mediaStorage()
        ).read(item.objectKey);
      }
    }
  }
  const { renderDesignPdf } = await import('./pdf');
  return {
    bytes: await renderDesignPdf(record.document, assets),
    name: record.document.name,
  };
}
