import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  mkdir,
  readFile,
  writeFile,
  unlink,
  stat,
  copyFile,
} from 'node:fs/promises';
import { join } from 'node:path';
import type { MediaStorage } from '../contracts/MediaStorage';
const keyPattern = /^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}(?:\.upload)?$/;
export class LocalMediaStorage implements MediaStorage {
  constructor(
    private directory: string,
    private secret: string,
    private origin: string,
  ) {}
  private path(key: string) {
    if (!keyPattern.test(key)) throw new Error('Invalid storage key.');
    return join(this.directory, 'uploads', key);
  }
  private sign(data: string) {
    return createHmac('sha256', this.secret).update(data).digest('hex');
  }
  async createUpload(key: string, mime: string, size: number) {
    this.path(key);
    const payload = Buffer.from(
      JSON.stringify({
        key: `${key}.upload`,
        mime,
        size,
        expires: Date.now() + 300000,
      }),
    ).toString('base64url');
    return {
      url: `${this.origin}/api/local-media/upload`,
      fields: { payload, signature: this.sign(payload) },
    };
  }
  async acceptUpload(payload: string, signature: string, bytes: Uint8Array) {
    const expected = this.sign(payload);
    if (
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      throw new Error('Invalid signature.');
    const input = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (
      input.expires < Date.now() ||
      bytes.length !== input.size ||
      bytes.length > 104857600
    )
      throw new Error('Upload invalid.');
    const path = this.path(input.key);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, bytes, { flag: 'wx', mode: 0o600 });
    await writeFile(`${path}.meta`, input.mime, { mode: 0o600 });
  }
  async promote(key: string, finalKey: string) {
    await copyFile(this.path(`${key}.upload`), this.path(finalKey), 1);
    await copyFile(
      `${this.path(`${key}.upload`)}.meta`,
      `${this.path(finalKey)}.meta`,
      1,
    );
  }
  async inspect(key: string) {
    const path = this.path(key);
    const [info, mime, bytes] = await Promise.all([
      stat(path),
      readFile(`${path}.meta`, 'utf8'),
      readFile(path),
    ]);
    return {
      size: info.size,
      mime,
      prefix: new Uint8Array(bytes.subarray(0, 8192)),
    };
  }
  async readUrl(key: string, downloadName?: string) {
    this.path(key);
    const payload = Buffer.from(
      JSON.stringify({ key, downloadName, expires: Date.now() + 60000 }),
    ).toString('base64url');
    return `${this.origin}/api/local-media/read?payload=${payload}&signature=${this.sign(payload)}`;
  }
  async readSigned(payload: string, signature: string) {
    const expected = this.sign(payload);
    if (
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      throw new Error('Invalid signature.');
    const input = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (input.expires < Date.now()) throw new Error('Expired.');
    const path = this.path(input.key);
    return {
      bytes: await readFile(path),
      mime: await readFile(`${path}.meta`, 'utf8'),
      downloadName: input.downloadName as string | undefined,
    };
  }
  async delete(key: string) {
    const path = this.path(key);
    await unlink(path).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
    await unlink(`${path}.meta`).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}
