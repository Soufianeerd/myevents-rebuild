import { exportEvent } from '@/server/media/export';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const query = new URL(request.url).searchParams;
    const archive = await exportEvent(
      id,
      { scope: query.get('scope') ?? 'event', ids: query.getAll('id') },
      request.signal,
    );
    return new Response(archive.stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${archive.name}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch {
    return new Response(
      'Export indisponible. Connectez-vous et vérifiez votre sélection dans les souvenirs de l’événement.',
      {
        status: 404,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
}
