import { env } from '@/lib/env';
import { mediaStorage } from '@/server/media/service';
import { LocalMediaStorage } from '@/providers/local/LocalMediaStorage';
export async function POST(request: Request) {
  if (env.APP_MODE !== 'local') return new Response(null, { status: 404 });
  try {
    if (Number(request.headers.get('content-length')) > 105000000)
      return new Response(null, { status: 413 });
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size > 104857600)
      return new Response(null, { status: 400 });
    const payload = String(form.get('payload')),
      signature = String(form.get('signature'));
    if (payload.length > 2000 || signature.length !== 64)
      return new Response(null, { status: 400 });
    const storage = await mediaStorage();
    if (!(storage instanceof LocalMediaStorage))
      return new Response(null, { status: 404 });
    await storage.acceptUpload(
      payload,
      signature,
      new Uint8Array(await file.arrayBuffer()),
    );
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}
