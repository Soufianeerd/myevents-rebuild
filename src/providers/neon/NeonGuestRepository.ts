import { sql } from 'drizzle-orm';
import {
  guestBookSchema,
  type GuestBook,
  type GuestBookRecord,
} from '@/core/guests/models';
import type { GuestRepository } from '../contracts/GuestRepository';
import type { ScopedDatabase } from './database';
function record(r: Record<string, unknown>): GuestBookRecord {
  return {
    eventId: String(r.event_id),
    tenantId: String(r.tenant_id),
    document: guestBookSchema.parse(r.document),
    revision: Number(r.revision),
    updatedAt: new Date(String(r.updated_at)).toISOString(),
  };
}
export class NeonGuestRepository implements GuestRepository {
  constructor(private db: ScopedDatabase) {}
  async get(id: string, tenant: string) {
    const r = (
      await this.db.query(
        sql`SELECT * FROM myevents.guest_books WHERE event_id=${id} AND tenant_id=${tenant}`,
      )
    )[0];
    return r ? record(r) : null;
  }
  async save(
    id: string,
    tenant: string,
    document: GuestBook,
    revision: number,
  ) {
    const rows =
      revision === 0
        ? await this.db.query(
            sql`INSERT INTO myevents.guest_books(event_id,tenant_id,document,revision) VALUES(${id},${tenant},${JSON.stringify(document)}::jsonb,1) ON CONFLICT DO NOTHING RETURNING *`,
          )
        : await this.db.query(
            sql`UPDATE myevents.guest_books SET document=${JSON.stringify(document)}::jsonb,revision=revision+1,updated_at=now() WHERE event_id=${id} AND tenant_id=${tenant} AND revision=${revision} RETURNING *`,
          );
    if (!rows[0])
      throw new Error(
        'La liste d’invités a été modifiée ailleurs. Rechargez la page.',
      );
    return record(rows[0]);
  }
}
