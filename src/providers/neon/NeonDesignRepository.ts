import { sql } from 'drizzle-orm';
import {
  designSchema,
  type Design,
  type DesignRecord,
} from '@/core/designs/models';
import type { DesignRepository } from '../contracts/DesignRepository';
import type { ScopedDatabase } from './database';
function record(r: Record<string, unknown>): DesignRecord {
  return {
    eventId: String(r.event_id),
    tenantId: String(r.tenant_id),
    document: designSchema.parse(r.document),
    revision: Number(r.revision),
    updatedAt: new Date(String(r.updated_at)).toISOString(),
  };
}
export class NeonDesignRepository implements DesignRepository {
  constructor(private db: ScopedDatabase) {}
  async get(id: string, tenant: string) {
    const r = (
      await this.db.query(
        sql`SELECT * FROM myevents.designs WHERE event_id=${id} AND tenant_id=${tenant}`,
      )
    )[0];
    return r ? record(r) : null;
  }
  async save(id: string, tenant: string, document: Design, revision: number) {
    const rows =
      revision === 0
        ? await this.db.query(
            sql`INSERT INTO myevents.designs(event_id,tenant_id,document,revision) VALUES(${id},${tenant},${JSON.stringify(document)}::jsonb,1) ON CONFLICT DO NOTHING RETURNING *`,
          )
        : await this.db.query(
            sql`UPDATE myevents.designs SET document=${JSON.stringify(document)}::jsonb,revision=revision+1,updated_at=now() WHERE event_id=${id} AND tenant_id=${tenant} AND revision=${revision} RETURNING *`,
          );
    if (!rows[0])
      throw new Error('La carte a été modifiée ailleurs. Rechargez la page.');
    return record(rows[0]);
  }
}
