import { sql } from 'drizzle-orm';
import {
  planningSchema,
  type Planning,
  type PlanningRecord,
} from '@/core/planning/models';
import type { PlanningRepository } from '../contracts/PlanningRepository';
import type { ScopedDatabase } from './database';
function record(r: Record<string, unknown>): PlanningRecord {
  return {
    eventId: String(r.event_id),
    tenantId: String(r.tenant_id),
    document: planningSchema.parse(r.document),
    revision: Number(r.revision),
    updatedAt: new Date(String(r.updated_at)).toISOString(),
  };
}
export class NeonPlanningRepository implements PlanningRepository {
  constructor(private db: ScopedDatabase) {}
  async get(id: string, tenant: string) {
    const r = (
      await this.db.query(
        sql`SELECT * FROM myevents.planning WHERE event_id=${id} AND tenant_id=${tenant}`,
      )
    )[0];
    return r ? record(r) : null;
  }
  async save(id: string, tenant: string, document: Planning, revision: number) {
    const rows =
      revision === 0
        ? await this.db.query(
            sql`INSERT INTO myevents.planning(event_id,tenant_id,document,revision) VALUES(${id},${tenant},${JSON.stringify(document)}::jsonb,1) ON CONFLICT DO NOTHING RETURNING *`,
          )
        : await this.db.query(
            sql`UPDATE myevents.planning SET document=${JSON.stringify(document)}::jsonb,revision=revision+1,updated_at=now() WHERE event_id=${id} AND tenant_id=${tenant} AND revision=${revision} RETURNING *`,
          );
    if (!rows[0])
      throw new Error(
        'L’organisation a été modifiée ailleurs. Rechargez la page.',
      );
    return record(rows[0]);
  }
}
