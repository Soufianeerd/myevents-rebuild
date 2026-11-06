import { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { ZipFile } from 'yazl';

export type ArchiveEntry = {
  path: string;
} & (
  | { bytes: Uint8Array }
  | {
      size: number;
      open: (signal: AbortSignal) => Promise<ReadableStream<Uint8Array>>;
    }
);

// Sources open one at a time; backpressure propagates to disk/S3, including cancellation.
export function streamZip(entries: ArchiveEntry[], signal?: AbortSignal) {
  const zip = new ZipFile();
  const output = zip.outputStream as Readable;
  const controller = new AbortController();
  let active: Readable | undefined;
  const fail = () => {
    controller.abort();
    active?.destroy();
    output.destroy(
      new Error('Le téléchargement a été interrompu. Relancez l’export.'),
    );
  };
  zip.on('error', fail);
  signal?.addEventListener('abort', fail, { once: true });
  output.on('close', () => {
    controller.abort();
    active?.destroy();
    signal?.removeEventListener('abort', fail);
  });
  // Register the Web stream's error listener before lazy entries start reading.
  const stream = Readable.toWeb(output) as ReadableStream<Uint8Array>;
  if (signal?.aborted) fail();
  for (const entry of entries) {
    if ('bytes' in entry) {
      zip.addBuffer(Buffer.from(entry.bytes), entry.path, {
        compress: false,
        mode: 0o100600,
      });
      continue;
    }
    zip.addReadStreamLazy(
      entry.path,
      { size: entry.size, compress: false, mode: 0o100600 },
      (callback) => {
        if (controller.signal.aborted) return;
        entry
          .open(controller.signal)
          .then((source) => {
            if (controller.signal.aborted) {
              void source.cancel().catch(() => undefined);
              return;
            }
            const input = Readable.fromWeb(
              source as NodeReadableStream<Uint8Array>,
            );
            active = input;
            input.on('error', fail);
            callback(null, input);
          })
          .catch(fail);
      },
    );
  }
  zip.end();
  return stream;
}
