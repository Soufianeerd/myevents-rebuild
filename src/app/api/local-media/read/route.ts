import { env } from '@/lib/env';
import { mediaStorage } from '@/server/media/service';
import { LocalMediaStorage } from '@/providers/local/LocalMediaStorage';
export async function GET(request: Request) {
  if (env.APP_MODE !== 'local') return new Response(null, { status: 404 });
  try {
    const url = new URL(request.url);
    const payload = url.searchParams.get('payload') ?? '',
      signature = url.searchParams.get('signature') ?? '';
    if (payload.length > 2000 || signature.length !== 64)
      return new Response(null, { status: 400 });
    const storage = await mediaStorage();
    if (!(storage instanceof LocalMediaStorage))
      return new Response(null, { status: 404 });
    const data = await storage.readSigned(payload, signature);
    return new Response(new Uint8Array(data.bytes), {
      headers: {
        'Content-Type': data.mime,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        ...(data.downloadName
          ? {
              'Content-Disposition': `attachment; filename="${data.downloadName.replace(/[^a-zA-Z0-9._-]/g, '_')}"`,
            }
          : {}),
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
