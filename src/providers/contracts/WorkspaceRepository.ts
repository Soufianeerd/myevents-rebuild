import type { Workspace } from '../../core/workspaces/models';
import type { WorkspaceId, TenantId } from '../../core/ids';

export interface WorkspaceRepository {
  create(workspace: Workspace): Promise<void>;

  // Notice that most of these require TenantId to enforce isolation
  findById(id: WorkspaceId, tenantId: TenantId): Promise<Workspace | null>;

  // Find workspaces for a specific tenant
  findByTenantId(tenantId: TenantId): Promise<Workspace[]>;

  update(workspace: Workspace): Promise<void>;
}
