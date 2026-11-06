import { mediaFileUrl } from '@/server/media/service';
export const dynamic = 'force-dynamic';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string; mediaId: string }> },
) {
  try {
    const { token, mediaId } = await params;
    const url = await mediaFileUrl(
      token,
      mediaId,
      new URL(request.url).searchParams.get('download') === '1',
      true,
    );
    if (!url)
      return new Response('Fichier indisponible', {
        status: 404,
        headers: {
          'Cache-Control': 'private, no-store',
          'Referrer-Policy': 'no-referrer',
        },
      });
    return new Response(null, {
      status: 307,
      headers: {
        Location: url,
        'Cache-Control': 'private, no-store',
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch {
    return new Response('Fichier indisponible', {
      status: 404,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }
}
