import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { eventLifecycleStatuses, type Event } from '@/core/events/models';
import type { EventId, WorkspaceId, TenantId, UserId } from '@/core/ids';
import type { EventRepository } from '../contracts/EventRepository';
import type { ScopedDatabase } from './database';

const schema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  type: z.string(),
  name: z.string(),
  start_at: z.coerce.date().transform((date) => date.toISOString()),
  end_at: z.coerce
    .date()
    .transform((date) => date.toISOString())
    .nullable(),
  timezone: z.string(),
  default_language: z.string(),
  primary_location: z.string().nullable(),
  estimated_guest_count: z.number().nullable(),
  lifecycle_status: z.enum(eventLifecycleStatuses),
  created_at: z.coerce.date().transform((date) => date.toISOString()),
  updated_at: z.coerce.date().transform((date) => date.toISOString()),
  deleted_at: z.coerce
    .date()
    .transform((date) => date.toISOString())
    .nullable(),
});
function fromRow(value: unknown): Event {
  const r = schema.parse(value);
  return {
    id: r.id as EventId,
    workspaceId: r.workspace_id as WorkspaceId,
    tenantId: r.tenant_id as TenantId,
    createdBy: r.created_by as UserId,
    type: r.type,
    name: r.name,
    startAt: r.start_at,
    endAt: r.end_at || undefined,
    timezone: r.timezone,
    defaultLanguage: r.default_language,
    primaryLocation: r.primary_location || undefined,
    estimatedGuestCount: r.estimated_guest_count ?? undefined,
    lifecycleStatus: r.lifecycle_status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at || undefined,
  };
}

export class NeonEventRepository implements EventRepository {
  constructor(private db: ScopedDatabase) {}
  async create(e: Event) {
    await this.db.query(sql`INSERT INTO myevents.events
      (id,workspace_id,tenant_id,created_by,type,name,start_at,end_at,timezone,default_language,primary_location,estimated_guest_count,lifecycle_status,created_at,updated_at)
      VALUES (${e.id},${e.workspaceId},${e.tenantId},${e.createdBy},${e.type},${e.name},${e.startAt},${e.endAt ?? null},${e.timezone},${e.defaultLanguage},${e.primaryLocation ?? null},${e.estimatedGuestCount ?? null},${e.lifecycleStatus},${e.createdAt},${e.updatedAt})`);
  }
  async findById(id: EventId, tenant: TenantId) {
    const rows = await this.db.query(
      sql`SELECT * FROM myevents.events WHERE id=${id} AND tenant_id=${tenant} AND deleted_at IS NULL`,
    );
    return rows[0] ? fromRow(rows[0]) : null;
  }
  async findByWorkspaceId(workspace: WorkspaceId, tenant: TenantId) {
    return (
      await this.db.query(
        sql`SELECT * FROM myevents.events WHERE workspace_id=${workspace} AND tenant_id=${tenant} AND deleted_at IS NULL ORDER BY created_at DESC,id`,
      )
    ).map(fromRow);
  }
  async update(e: Event) {
    const rows = await this.db.query(
      sql`UPDATE myevents.events SET name=${e.name},start_at=${e.startAt},end_at=${e.endAt ?? null},timezone=${e.timezone},default_language=${e.defaultLanguage},primary_location=${e.primaryLocation ?? null},estimated_guest_count=${e.estimatedGuestCount ?? null},updated_at=${e.updatedAt},deleted_at=${e.deletedAt ?? null} WHERE id=${e.id} AND tenant_id=${e.tenantId} AND deleted_at IS NULL RETURNING id`,
    );
    if (rows.length !== 1) throw new Error('Unable to update event.');
  }
}
