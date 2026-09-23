import { ownerImageUrl } from '@/server/media/service';
export const dynamic = 'force-dynamic';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> },
) {
  try {
    const { id, assetId } = await params;
    const url = await ownerImageUrl(id, assetId);
    if (!url) return new Response('Image indisponible', { status: 404 });
    return new Response(null, {
      status: 307,
      headers: {
        Location: url,
        'Cache-Control': 'private, no-store',
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch {
    return new Response('Image indisponible', {
      status: 404,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }
}
