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
import { mediaRepository, mediaStorage } from '@/server/media/service';
import {
  designSchema,
  newThankYou,
  validateDesignRights,
} from '@/core/designs/models';
import type { DesignRepository } from '@/providers/contracts/DesignRepository';
async function repository(): Promise<DesignRepository> {
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
export async function designState(id: string) {
  const { event, context, repository: experience } = await eventScope(id);
  const [record, orders, media] = await Promise.all([
    (await repository()).get(id, context.tenantId),
    experience.entitlements(id, context.tenantId),
    (await mediaRepository()).list(id, context.tenantId),
  ]);
  const products = orders;
  const images = media.filter(
    (m) => m.status === 'ready' && m.mime.startsWith('image/'),
  );
  const storage = images.length ? await mediaStorage() : null;
  const assets: Record<string, string> = Object.fromEntries(
    await Promise.all(
      images.map(async (m) => [m.id, await storage!.readUrl(m.objectKey)]),
    ),
  );
  for (const kind of ['audio', 'photo_video'] as const)
    if (products.includes(kind))
      assets[kind] = await QRCode.toDataURL(
        `${appOrigin()}/souvenirs/${tokenFor(id, kind)}`,
        { width: 600, margin: 4 },
      );
  return {
    document: record?.document ?? newThankYou(event.name, randomUUID),
    revision: record?.revision ?? 0,
    products,
    assets,
    imageChoices: images.map((i) => ({ id: i.id, name: i.name })),
  };
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
