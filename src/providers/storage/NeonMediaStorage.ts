import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import type { MediaStorage } from '@/providers/contracts/MediaStorage';
export class NeonMediaStorage implements MediaStorage {
  private client: S3Client;
  constructor(
    private bucket: string,
    config: {
      endpoint: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    },
  ) {
    const url = new URL(config.endpoint);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.neon.tech'))
      throw new Error('Expected Neon storage endpoint.');
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  async createUpload(key: string, mime: string, size: number) {
    return createPresignedPost(this.client, {
      Bucket: this.bucket,
      Key: `${key}.upload`,
      Expires: 300,
      Fields: { 'Content-Type': mime },
      Conditions: [
        ['content-length-range', size, size],
        ['eq', '$Content-Type', mime],
      ],
    });
  }
  async promote(key: string, finalKey: string) {
    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        Key: finalKey,
        CopySource: `${this.bucket}/${key}.upload`,
      }),
    );
  }
  async inspect(key: string) {
    const head = await this.client.send(
      new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const object = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Range: 'bytes=0-8191',
      }),
    );
    return {
      size: head.ContentLength ?? 0,
      mime: head.ContentType ?? '',
      prefix: await object.Body!.transformToByteArray(),
    };
  }
  async readUrl(key: string, downloadName?: string) {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ...(downloadName
          ? {
              ResponseContentDisposition: `attachment; filename="${downloadName.replace(/[^a-zA-Z0-9._-]/g, '_')}"`,
            }
          : {}),
      }),
      { expiresIn: 60 },
    );
  }
  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
