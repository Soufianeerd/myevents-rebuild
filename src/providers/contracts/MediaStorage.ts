export interface MediaStorage {
  stream(
    key: string,
    signal?: AbortSignal,
  ): Promise<ReadableStream<Uint8Array>>;
  read(key: string): Promise<Uint8Array>;
  createUpload(
    key: string,
    mime: string,
    size: number,
  ): Promise<{ url: string; fields: Record<string, string> }>;
  promote(key: string, finalKey: string): Promise<void>;
  inspect(
    key: string,
  ): Promise<{ size: number; mime: string; prefix: Uint8Array }>;
  readUrl(key: string, downloadName?: string): Promise<string>;
  delete(key: string): Promise<void>;
}
