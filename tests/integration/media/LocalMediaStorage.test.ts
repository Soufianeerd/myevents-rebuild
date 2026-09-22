import { it, expect } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { LocalMediaStorage } from '@/providers/local/LocalMediaStorage';
it('validates upload signatures and keeps finalized content separate from replayable upload URLs', async () => {
  const directory = await mkdtemp(`${tmpdir()}/myevents-storage-`);
  try {
    const storage = new LocalMediaStorage(
      directory,
      'test-secret',
      'http://localhost',
    );
    const prefix = `${randomUUID()}/${randomUUID()}`,
      key = `${prefix}/${randomUUID()}`,
      finalKey = `${prefix}/${randomUUID()}`;
    const upload = await storage.createUpload(key, 'image/png', 3);
    await expect(
      storage.acceptUpload(
        upload.fields.payload,
        '0'.repeat(64),
        new Uint8Array([1, 2, 3]),
      ),
    ).rejects.toThrow();
    await expect(
      storage.acceptUpload(
        upload.fields.payload,
        upload.fields.signature,
        new Uint8Array([1]),
      ),
    ).rejects.toThrow();
    await storage.acceptUpload(
      upload.fields.payload,
      upload.fields.signature,
      new Uint8Array([1, 2, 3]),
    );
    await storage.promote(key, finalKey);
    await storage.delete(`${key}.upload`);
    await storage.acceptUpload(
      upload.fields.payload,
      upload.fields.signature,
      new Uint8Array([4, 5, 6]),
    );
    expect(Array.from((await storage.inspect(finalKey)).prefix)).toEqual([
      1, 2, 3,
    ]);
    const url = new URL(await storage.readUrl(finalKey));
    expect(
      Array.from(
        (
          await storage.readSigned(
            url.searchParams.get('payload')!,
            url.searchParams.get('signature')!,
          )
        ).bytes,
      ),
    ).toEqual([1, 2, 3]);
    await expect(
      storage.createUpload('../escape', 'image/png', 3),
    ).rejects.toThrow();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
