import QRCode from 'qrcode';
import { eventScope, tokenFor, appOrigin } from '@/server/experience/service';
import { mediaRepository } from '@/server/media/service';
import { mediaKindSchema } from '@/core/media/models';
import { assertProduct } from '@/core/commerce/catalog';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const kind = mediaKindSchema.parse(url.searchParams.get('kind'));
    const { context, repository } = await eventScope(id);
    assertProduct(await repository.entitlements(id, context.tenantId), kind);
    const space = (
      await (await mediaRepository()).spaces(id, context.tenantId)
    ).find((s) => s.kind === kind && s.enabled);
    if (!space) return new Response(null, { status: 404 });
    const png = await QRCode.toBuffer(
      `${appOrigin()}/souvenirs/${tokenFor(id, kind)}`,
      {
        width: 800,
        margin: 4,
        errorCorrectionLevel: 'M',
        color: { dark: '#641d2b', light: '#ffffff' },
      },
    );
    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, no-store',
        ...(url.searchParams.has('download')
          ? {
              'Content-Disposition': `attachment; filename="myevents-${kind}.png"`,
            }
          : {}),
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
