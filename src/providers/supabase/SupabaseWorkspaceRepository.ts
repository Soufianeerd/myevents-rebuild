import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceRepository } from '../contracts/WorkspaceRepository';
import type { Workspace } from '@/core/workspaces/models';
import type { WorkspaceId, TenantId } from '@/core/ids';
import { z } from 'zod';

const schema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
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
const toRow = (w: Workspace) => ({
  id: w.id,
  tenant_id: w.tenantId,
  name: w.name,
  created_at: w.createdAt,
  updated_at: w.updatedAt,
});

export class SupabaseWorkspaceRepository implements WorkspaceRepository {
  constructor(private client: SupabaseClient) {}
  async getOrCreatePrimary(candidate: Workspace) {
    const { error } = await this.client
      .from('workspaces')
      .upsert(toRow(candidate), {
        onConflict: 'tenant_id',
        ignoreDuplicates: true,
      });
    if (error) throw new Error('Unable to create primary workspace.');
    const list = await this.findByTenantId(candidate.tenantId);
    if (list.length !== 1) throw new Error('Primary workspace is unavailable.');
    return list[0];
  }
  async create(workspace: Workspace) {
    const { error } = await this.client
      .from('workspaces')
      .insert(toRow(workspace));
    if (error) throw new Error('Unable to create workspace.');
  }
  async findById(id: WorkspaceId, tenantId: TenantId) {
    const { data, error } = await this.client
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw new Error('Unable to read workspace.');
    return data ? fromRow(data) : null;
  }
  async findByTenantId(tenantId: TenantId) {
    const { data, error } = await this.client
      .from('workspaces')
      .select('*')
      .eq('tenant_id', tenantId);
    if (error) throw new Error('Unable to read workspaces.');
    return (data || []).map(fromRow);
  }
  async update(workspace: Workspace) {
    const { data, error } = await this.client
      .from('workspaces')
      .update({ name: workspace.name, updated_at: workspace.updatedAt })
      .eq('id', workspace.id)
      .eq('tenant_id', workspace.tenantId)
      .select('id');
    if (error || data?.length !== 1)
      throw new Error('Unable to update workspace.');
  }
}
