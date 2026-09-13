import type { SupabaseClient } from '@supabase/supabase-js';
import type { EventRepository } from '../contracts/EventRepository';
import type { Event } from '@/core/events/models';
import type { EventId, WorkspaceId, TenantId, UserId } from '@/core/ids';
import { z } from 'zod';

const schema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  type: z.string(),
  name: z.string(),
  start_at: z.string(),
  end_at: z.string().nullable(),
  timezone: z.string(),
  default_language: z.string(),
  primary_location: z.string().nullable(),
  estimated_guest_count: z.number().nullable(),
  lifecycle_status: z.enum(['draft', 'published', 'archived']),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
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
function mutableRow(e: Event) {
  return {
    name: e.name,
    start_at: e.startAt,
    end_at: e.endAt || null,
    timezone: e.timezone,
    default_language: e.defaultLanguage,
    primary_location: e.primaryLocation || null,
    estimated_guest_count: e.estimatedGuestCount ?? null,
    updated_at: e.updatedAt,
    deleted_at: e.deletedAt || null,
  };
}

export class SupabaseEventRepository implements EventRepository {
  constructor(private client: SupabaseClient) {}
  async create(event: Event) {
    const { error } = await this.client.from('events').insert({
      ...mutableRow(event),
      id: event.id,
      workspace_id: event.workspaceId,
      tenant_id: event.tenantId,
      created_by: event.createdBy,
      type: event.type,
      lifecycle_status: event.lifecycleStatus,
      created_at: event.createdAt,
    });
    if (error) throw new Error('Unable to create event.');
  }
  async findById(id: EventId, tenantId: TenantId) {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw new Error('Unable to read event.');
    return data ? fromRow(data) : null;
  }
  async findByWorkspaceId(workspaceId: WorkspaceId, tenantId: TenantId) {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw new Error('Unable to list events.');
    return (data || []).map(fromRow);
  }
  async update(event: Event) {
    const { data, error } = await this.client
      .from('events')
      .update(mutableRow(event))
      .eq('id', event.id)
      .eq('tenant_id', event.tenantId)
      .is('deleted_at', null)
      .select('id');
    if (error || data?.length !== 1) throw new Error('Unable to update event.');
  }
}
