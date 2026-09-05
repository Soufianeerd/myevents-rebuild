import { WorkspaceId, TenantId } from '../ids';

export interface Workspace {
  id: WorkspaceId;
  tenantId: TenantId; // The boundary for data isolation
  name: string; // Default could be something like "Espace de Jean"
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
