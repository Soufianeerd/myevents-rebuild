import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest';
import { GetOrCreateWorkspaceUseCase } from '../../../../src/core/workspaces/usecases/GetOrCreateWorkspaceUseCase';
import type {
  WorkspaceRepository,
  IdGenerator,
  Clock,
} from '../../../../src/providers/contracts';
import type { AccessContext } from '../../../../src/core/access/access';
import { createId } from '../../../../src/core/ids';
import type { Workspace } from '../../../../src/core/workspaces/models';

describe('GetOrCreateWorkspaceUseCase', () => {
  let useCase: GetOrCreateWorkspaceUseCase;
  let mockWorkspaceRepo: Mocked<WorkspaceRepository>;
  let mockIdGenerator: Mocked<IdGenerator>;
  let mockClock: Mocked<Clock>;

  const mockContext: AccessContext = {
    kind: 'user',
    userId: createId('user-1'),
    tenantId: createId('tenant-1'),
  };

  beforeEach(() => {
    mockWorkspaceRepo = {
      create: vi.fn(),
      getOrCreatePrimary: vi
        .fn()
        .mockImplementation(async (candidate) => candidate),
      findById: vi.fn(),
      findByTenantId: vi.fn(),
      update: vi.fn(),
    };
    mockIdGenerator = {
      generate: vi.fn().mockReturnValue('mock-workspace-id'),
    };
    mockClock = {
      now: vi.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')),
    };

    useCase = new GetOrCreateWorkspaceUseCase(
      mockWorkspaceRepo,
      mockIdGenerator,
      mockClock,
    );
  });

  it('should return error if not authenticated', async () => {
    const result = await useCase.execute({ kind: 'anonymous' });
    expect(result.ok).toBe(false);
  });

  it('should return existing workspace if one exists', async () => {
    const existingWorkspace: Workspace = {
      id: createId('workspace-1'),
      tenantId: createId('tenant-1'),
      name: 'Existing',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };
    mockWorkspaceRepo.findByTenantId.mockResolvedValue([existingWorkspace]);

    const result = await useCase.execute(mockContext);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(existingWorkspace);
    }
    expect(mockWorkspaceRepo.create).not.toHaveBeenCalled();
  });

  it('should create new workspace if none exists', async () => {
    mockWorkspaceRepo.findByTenantId.mockResolvedValue([]);

    const result = await useCase.execute(mockContext);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('mock-workspace-id');
      expect(result.value.tenantId).toBe('tenant-1');
    }
    expect(mockWorkspaceRepo.getOrCreatePrimary).toHaveBeenCalledTimes(1);
  });
});
