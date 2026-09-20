import { sql } from 'drizzle-orm';
import { z } from 'zod';
import type { Workspace } from '@/core/workspaces/models';
import type { WorkspaceId, TenantId } from '@/core/ids';
import type { WorkspaceRepository } from '../contracts/WorkspaceRepository';
import type { ScopedDatabase } from './database';

const schema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  created_at: z.coerce.date().transform((date) => date.toISOString()),
  updated_at: z.coerce.date().transform((date) => date.toISOString()),
});
function fromRow(value: unknown): Workspace {
  const r = schema.parse(value);
  return {
    id: r.id as WorkspaceId,
    tenantId: r.tenant_id as TenantId,
    name: r.name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export class NeonWorkspaceRepository implements WorkspaceRepository {
  constructor(private db: ScopedDatabase) {}
  async getOrCreatePrimary(candidate: Workspace) {
    // Identity provisioning creates exactly one workspace atomically. Reading
    // first also lets a migrated viewer open their existing workspace.
    const existing = await this.findByTenantId(candidate.tenantId);
    if (existing.length === 1) return existing[0];
    await this.db.query(
      sql`INSERT INTO myevents.workspaces(id,tenant_id,name,created_at,updated_at) VALUES(${candidate.id},${candidate.tenantId},${candidate.name},${candidate.createdAt},${candidate.updatedAt}) ON CONFLICT(tenant_id) DO NOTHING`,
    );
    const rows = await this.findByTenantId(candidate.tenantId);
    if (rows.length !== 1) throw new Error('Primary workspace is unavailable.');
    return rows[0];
  }
  async create(w: Workspace) {
    await this.db.query(
      sql`INSERT INTO myevents.workspaces(id,tenant_id,name,created_at,updated_at) VALUES(${w.id},${w.tenantId},${w.name},${w.createdAt},${w.updatedAt})`,
    );
  }
  async findById(id: WorkspaceId, tenant: TenantId) {
    const rows = await this.db.query(
      sql`SELECT * FROM myevents.workspaces WHERE id=${id} AND tenant_id=${tenant}`,
    );
    return rows[0] ? fromRow(rows[0]) : null;
  }
  async findByTenantId(tenant: TenantId) {
    return (
      await this.db.query(
        sql`SELECT * FROM myevents.workspaces WHERE tenant_id=${tenant}`,
      )
    ).map(fromRow);
  }
  async update(w: Workspace) {
    const rows = await this.db.query(
      sql`UPDATE myevents.workspaces SET name=${w.name},updated_at=${w.updatedAt} WHERE id=${w.id} AND tenant_id=${w.tenantId} RETURNING id`,
    );
    if (rows.length !== 1) throw new Error('Unable to update workspace.');
  }
}
