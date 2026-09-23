import { invitationImageUrl } from '@/server/media/service';
export const dynamic = 'force-dynamic';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; assetId: string }> },
) {
  try {
    const { token, assetId } = await params;
    const url = await invitationImageUrl(token, assetId);
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
