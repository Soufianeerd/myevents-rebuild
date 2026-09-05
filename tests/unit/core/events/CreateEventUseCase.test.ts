import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest';
import { CreateEventUseCase } from '../../../../src/core/events/usecases/CreateEventUseCase';
import { GetOrCreateWorkspaceUseCase } from '../../../../src/core/workspaces/usecases/GetOrCreateWorkspaceUseCase';
import type {
  EventRepository,
  IdGenerator,
  Clock,
} from '../../../../src/providers/contracts';
import type { AccessContext } from '../../../../src/core/access/access';
import { createId } from '../../../../src/core/ids';
import { ok } from '../../../../src/core/result';

describe('CreateEventUseCase', () => {
  let useCase: CreateEventUseCase;
  let mockEventRepo: Mocked<EventRepository>;
  let mockGetOrCreateWorkspace: Mocked<GetOrCreateWorkspaceUseCase>;
  let mockIdGenerator: Mocked<IdGenerator>;
  let mockClock: Mocked<Clock>;

  const mockContext: AccessContext = {
    kind: 'user',
    userId: createId('user-1'),
    tenantId: createId('tenant-1'),
  };

  beforeEach(() => {
    mockEventRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByWorkspaceId: vi.fn(),
      update: vi.fn(),
    };
    mockGetOrCreateWorkspace = {
      execute: vi.fn().mockResolvedValue(
        ok({
          id: createId('workspace-1'),
          tenantId: createId('tenant-1'),
          name: 'Workspace',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        }),
      ),
    } as unknown as Mocked<GetOrCreateWorkspaceUseCase>;
    mockIdGenerator = {
      generate: vi.fn().mockReturnValue('mock-event-id'),
    };
    mockClock = {
      now: vi.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')),
    };

    useCase = new CreateEventUseCase(
      mockEventRepo,
      mockGetOrCreateWorkspace,
      mockIdGenerator,
      mockClock,
    );
  });

  it('should return error if not authenticated', async () => {
    const result = await useCase.execute(
      { kind: 'anonymous' },
      {
        type: 'wedding',
        name: 'Test',
        startAt: '2026-02-01T10:00',
        timezone: 'UTC',
        defaultLanguage: 'fr',
      },
    );
    expect(result.ok).toBe(false);
  });

  it('should create an event', async () => {
    const result = await useCase.execute(mockContext, {
      type: 'wedding',
      name: 'Mariage de Test',
      startAt: '2026-02-01T10:00',
      timezone: 'UTC',
      defaultLanguage: 'fr',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('mock-event-id');
      expect(result.value.name).toBe('Mariage de Test');
      expect(result.value.lifecycleStatus).toBe('draft');
      expect(result.value.workspaceId).toBe('workspace-1');
      expect(result.value.tenantId).toBe('tenant-1');
      expect(result.value.createdBy).toBe('user-1');
    }

    expect(mockEventRepo.create).toHaveBeenCalledTimes(1);
    expect(mockGetOrCreateWorkspace.execute).toHaveBeenCalledWith(mockContext);
  });
});
