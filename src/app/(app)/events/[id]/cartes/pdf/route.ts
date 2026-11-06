import { exportDesignPdf } from '@/server/designs/service';
export const runtime = 'nodejs';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = {
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow',
  };
  try {
    const { id } = await params;
    const result = await exportDesignPdf(
      id,
      new URL(request.url).searchParams.get('revision'),
    );
    return new Response(new Uint8Array(result.bytes), {
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="myevents-remerciement.pdf"; filename*=UTF-8''${encodeURIComponent(result.name)}.pdf`,
      },
    });
  } catch {
    return new Response(
      'Carte indisponible. Vérifiez vos droits et enregistrez votre création avant de réessayer.',
      { status: 404, headers },
    );
  }
}
