import type { Workspace } from '../models';
import type {
  WorkspaceRepository,
  IdGenerator,
  Clock,
} from '../../../providers/contracts';
import type { WorkspaceId } from '../../ids';
import type { AccessContext } from '../../access/access';
import { requireAuthentication } from '../../access/access';
import { Result, ok, err } from '../../result';
import type { AppError } from '../../errors';

export class GetOrCreateWorkspaceUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(context: AccessContext): Promise<Result<Workspace, AppError>> {
    const authResult = requireAuthentication(context);
    if (!authResult.ok) {
      return err(authResult.error);
    }
    const userContext = authResult.value;

    const workspaces = await this.workspaceRepository.findByTenantId(
      userContext.tenantId,
    );

    // For now, B2C: 1 Tenant = 1 Workspace
    if (workspaces.length > 0) {
      return ok(workspaces[0]);
    }

    const now = this.clock.now().toISOString();
    const newWorkspace: Workspace = {
      id: this.idGenerator.generate() as WorkspaceId,
      tenantId: userContext.tenantId,
      name: 'Espace personnel',
      createdAt: now,
      updatedAt: now,
    };

    await this.workspaceRepository.create(newWorkspace);
    return ok(newWorkspace);
  }
}
