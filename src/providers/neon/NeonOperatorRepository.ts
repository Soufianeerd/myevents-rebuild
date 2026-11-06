import { sql } from 'drizzle-orm';
import {
  operatorOverviewSchema,
  printStages,
  stageUpdateSchema,
  type StageUpdate,
} from '@/core/admin/models';
import type { ScopedDatabase } from './database';
import type {
  OperatorRepository,
  RequestStage,
} from '../contracts/OperatorRepository';

/**
 * `service` runs without a user identity and passes the operator secret to
 * the SECURITY DEFINER functions; `tenant` is the authenticated owner scope.
 */
export class NeonOperatorRepository implements OperatorRepository {
  constructor(
    private service: ScopedDatabase,
    private tenant: ScopedDatabase | null,
    private secret: string | undefined,
  ) {}
  private requireSecret() {
    if (!this.secret || this.secret.length < 32)
      throw new Error('Accès opérateur non configuré.');
    return this.secret;
  }
  async overview() {
    const rows = await this.service.query(
      sql`SELECT myevents.operator_overview(${this.requireSecret()}) AS data`,
    );
    return operatorOverviewSchema.parse(rows[0]?.data);
  }
  async setStage(input: StageUpdate) {
    const update = stageUpdateSchema.parse(input);
    await this.service.query(
      sql`SELECT myevents.operator_set_request_stage(${this.requireSecret()},${update.requestId},${update.stage},${update.note})`,
    );
  }
  async latestStages(eventId: string, tenantId: string) {
    if (!this.tenant) throw new Error('Connectez-vous pour continuer.');
    const rows = await this.tenant.query(
      sql`SELECT DISTINCT ON (s.request_id) s.request_id,s.stage,s.note,s.created_at FROM myevents.material_request_stages s JOIN myevents.material_requests m ON m.id=s.request_id WHERE m.event_id=${eventId} AND s.tenant_id=${tenantId} ORDER BY s.request_id,s.created_at DESC`,
    );
    return rows.map((r): RequestStage => ({
      requestId: String(r.request_id),
      stage: printStages.find((s) => s === r.stage) ?? 'requested',
      note: String(r.note ?? ''),
      createdAt: new Date(String(r.created_at)).toISOString(),
    }));
  }
}
