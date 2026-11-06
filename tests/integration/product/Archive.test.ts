import { expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { LocalMediaStorage } from '@/providers/local/LocalMediaStorage';
import { streamZip } from '@/server/media/zip';
import { readZip } from '../../helpers/readZip';

it('streams original local media into a readable ZIP without changing bytes or loading all sources at once', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'myevents-zip-'));
  try {
    const storage = new LocalMediaStorage(
      directory,
      'unused',
      'http://localhost:3200',
    );
    const key = `${randomUUID()}/${randomUUID()}/${randomUUID()}`;
    await mkdir(dirname(join(directory, 'uploads', key)), { recursive: true });
    const bytes = Buffer.alloc(2 * 1024 * 1024, 81);
    await writeFile(join(directory, 'uploads', key), bytes);
    const opened: string[] = [];
    const stream = streamZip(
      ['photo', 'video'].map((name) => ({
        path: `Evenement/${name}.bin`,
        size: bytes.length,
        open: (signal) => {
          opened.push(name);
          return storage.stream(key, signal);
        },
      })),
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(opened).toEqual(['photo']);
    const files = await readZip(
      Buffer.from(await new Response(stream).arrayBuffer()),
    );
    expect(opened).toEqual(['photo', 'video']);
    expect(files.get('Evenement/photo.bin')).toEqual(bytes);
    expect(files.get('Evenement/video.bin')).toEqual(bytes);
    await expect(storage.stream('../../etc/passwd')).rejects.toThrow();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
it('aborts the source and does not open later files when the recipient cancels', async () => {
  const abort = new AbortController();
  let cancelled = false,
    secondOpened = false;
  const output = streamZip(
    [
      {
        path: 'first.bin',
        size: 100000000,
        open: async () =>
          new ReadableStream<Uint8Array>({
            pull(controller) {
              controller.enqueue(new Uint8Array(65536));
            },
            cancel() {
              cancelled = true;
            },
          }),
      },
      {
        path: 'second.bin',
        size: 0,
        open: async () => {
          secondOpened = true;
          return new ReadableStream();
        },
      },
    ],
    abort.signal,
  );
  const reader = output.getReader();
  await reader.read();
  abort.abort();
  await expect(
    (async () => {
      while (!(await reader.read()).done) {}
    })(),
  ).rejects.toThrow();
  await new Promise((resolve) => setImmediate(resolve));
  expect(cancelled).toBe(true);
  expect(secondOpened).toBe(false);
});
it('fails the download for missing or truncated media instead of producing an apparently complete archive', async () => {
  for (const open of [
    async () => {
      throw new Error('Private path must not be leaked');
    },
    async () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(1));
          controller.close();
        },
      }),
  ]) {
    const result = new Response(
      streamZip([{ path: 'photo.jpg', size: 30, open }]),
    );
    await expect(result.arrayBuffer()).rejects.toThrow(
      'Le téléchargement a été interrompu',
    );
  }
});
