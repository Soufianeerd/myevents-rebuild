import { z } from 'zod';
import type { WorkspaceRepository } from '../contracts/WorkspaceRepository';
import type { Workspace } from '../../core/workspaces/models';
import type { WorkspaceId, TenantId } from '../../core/ids';
import { LocalJsonStore } from './persistence/LocalJsonStore';

const WorkspaceSchema = z.object({
  id: z.string().transform((val) => val as WorkspaceId),
  tenantId: z.string().transform((val) => val as TenantId),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const WorkspacesSchema = z.record(z.string(), WorkspaceSchema);
type WorkspacesMap = z.infer<typeof WorkspacesSchema>;

export class LocalWorkspaceRepository implements WorkspaceRepository {
  private store: LocalJsonStore<WorkspacesMap>;

  constructor(dataDir: string) {
    this.store = new LocalJsonStore<WorkspacesMap>({
      baseDir: dataDir,
      collectionName: 'workspaces',
      schema: WorkspacesSchema,
    });
  }

  async getOrCreatePrimary(candidate: Workspace): Promise<Workspace> {
    let workspace = candidate;
    await this.store.update((data) => {
      const workspaces = data || {};
      const existing = Object.values(workspaces).find(
        (w) => w.tenantId === candidate.tenantId,
      );
      if (existing) workspace = existing;
      else {
        if (workspaces[candidate.id])
          throw new Error('Workspace ID already exists');
        workspaces[candidate.id] = candidate;
      }
      return workspaces;
    });
    return workspace;
  }

  async create(workspace: Workspace): Promise<void> {
    await this.store.update((data) => {
      const workspaces = data || {};
      if (
        workspaces[workspace.id] ||
        Object.values(workspaces).some((w) => w.tenantId === workspace.tenantId)
      ) {
        throw new Error(`Workspace with id ${workspace.id} already exists`);
      }
      workspaces[workspace.id] = workspace;
      return workspaces;
    });
  }

  async findById(
    id: WorkspaceId,
    tenantId: TenantId,
  ): Promise<Workspace | null> {
    const workspaces = (await this.store.read()) || {};
    const workspace = workspaces[id];

    // Strict isolation enforcement
    if (workspace && workspace.tenantId === tenantId) {
      return workspace;
    }
    return null;
  }

  async findByTenantId(tenantId: TenantId): Promise<Workspace[]> {
    const workspaces = (await this.store.read()) || {};
    return Object.values(workspaces).filter((w) => w.tenantId === tenantId);
  }

  async update(workspace: Workspace): Promise<void> {
    await this.store.update((data) => {
      const workspaces = data || {};
      const existing = workspaces[workspace.id];
      if (existing && existing.tenantId === workspace.tenantId) {
        workspaces[workspace.id] = workspace;
      }
      return workspaces;
    });
  }
}
