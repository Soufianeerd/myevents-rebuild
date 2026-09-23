import { sql } from 'drizzle-orm';
import type { ScopedDatabase } from './database';
import type {
  MediaRepository,
  PublicMediaSpace,
} from '../contracts/MediaRepository';
import type {
  MediaItem,
  MediaKind,
  MediaSpace,
  UploadRequest,
} from '@/core/media/models';
function item(r: Record<string, unknown>): MediaItem {
  return {
    id: String(r.id),
    eventId: String(r.event_id),
    tenantId: String(r.tenant_id),
    kind: r.kind as MediaKind,
    purpose: r.purpose === 'design' ? 'design' : 'guest',
    objectKey: String(r.object_key),
    name: String(r.name),
    author: String(r.author),
    mime: String(r.mime),
    size: Number(r.size),
    status: r.status as MediaItem['status'],
    hidden: Boolean(r.hidden),
    favorite: Boolean(r.favorite),
    createdAt: new Date(String(r.created_at)).toISOString(),
  };
}
export class NeonMediaRepository implements MediaRepository {
  constructor(private db: ScopedDatabase) {}
  async configure(
    id: string,
    _tenant: string,
    kind: MediaKind,
    hash: string,
    config: Omit<MediaSpace, 'eventId' | 'kind'>,
  ) {
    void _tenant;
    await this.db.query(
      sql`SELECT myevents.configure_media(${id},${kind},${hash},${JSON.stringify(config)}::jsonb)`,
    );
  }
  async spaces(id: string, _tenant: string) {
    void _tenant;
    return (
      await this.db.query(
        sql`SELECT * FROM myevents.media_spaces WHERE event_id=${id}`,
      )
    ).map((r) => ({
      eventId: String(r.event_id),
      kind: r.kind as MediaKind,
      enabled: Boolean(r.enabled),
      collaborative: Boolean(r.collaborative),
      availableAt: new Date(String(r.available_at)).toISOString(),
      allowDownload: Boolean(r.allow_download),
    }));
  }
  async publicSpace(hash: string): Promise<PublicMediaSpace | null> {
    const r = (
      await this.db.query(
        sql`SELECT * FROM myevents.public_media_space(${hash})`,
      )
    )[0];
    return r
      ? {
          eventId: String(r.event_id),
          kind: r.kind as MediaKind,
          title: String(r.title),
          collaborative: Boolean(r.collaborative),
          availableAt: new Date(String(r.available_at)).toISOString(),
          allowDownload: Boolean(r.allow_download),
        }
      : null;
  }
  async reserveDesign(
    eventId: string,
    _tenant: string,
    id: string,
    uploadHash: string,
    input: UploadRequest,
  ) {
    void _tenant;
    const rows = await this.db.query(
      sql`SELECT myevents.reserve_design_image(${eventId},${id},${uploadHash},${JSON.stringify(input)}::jsonb) AS object_key`,
    );
    return String(rows[0].object_key);
  }
  async publicInvitationImage(hash: string, id: string) {
    const rows = await this.db.query(
      sql`SELECT myevents.public_invitation_image(${hash},${id}) AS object_key`,
    );
    return rows[0]?.object_key ? String(rows[0].object_key) : null;
  }
  async reserve(
    hash: string,
    id: string,
    uploadHash: string,
    input: UploadRequest,
  ) {
    const r = (
      await this.db.query(
        sql`SELECT * FROM myevents.reserve_media(${hash},${id},${uploadHash},${JSON.stringify(input)}::jsonb)`,
      )
    )[0];
    return String(r.object_key);
  }
  async pending(id: string, hash: string) {
    const r = (
      await this.db.query(
        sql`SELECT * FROM myevents.pending_media(${id},${hash})`,
      )
    )[0];
    return r ? item(r) : null;
  }
  async complete(
    id: string,
    hash: string,
    size: number,
    mime: string,
    finalKey: string,
  ) {
    await this.db.query(
      sql`SELECT myevents.complete_media(${id},${hash},${size},${mime},${finalKey})`,
    );
  }
  async cancel(id: string, hash: string) {
    await this.db.query(sql`SELECT myevents.cancel_media(${id},${hash})`);
  }
  async list(id: string, tenant: string) {
    return (
      await this.db.query(
        sql`SELECT * FROM myevents.media_items WHERE event_id=${id} AND tenant_id=${tenant} AND status<>'deleted' ORDER BY created_at DESC`,
      )
    ).map(item);
  }
  async shared(hash: string) {
    return (
      await this.db.query(sql`SELECT * FROM myevents.shared_media(${hash})`)
    ).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      author: String(r.author),
      mime: String(r.mime),
      size: Number(r.size),
      createdAt: new Date(String(r.created_at)).toISOString(),
      objectKey: String(r.object_key),
      allowDownload: Boolean(r.allow_download),
    }));
  }
  async moderate(
    id: string,
    event: string,
    tenant: string,
    patch: {
      name?: string;
      hidden?: boolean;
      favorite?: boolean;
      status?: 'deleted';
    },
  ) {
    await this.db.query(
      sql`UPDATE myevents.media_items SET name=coalesce(${patch.name ?? null},name),hidden=coalesce(${patch.hidden ?? null},hidden),favorite=coalesce(${patch.favorite ?? null},favorite),status=coalesce(${patch.status ?? null},status) WHERE id=${id} AND event_id=${event} AND tenant_id=${tenant}`,
    );
  }
}
