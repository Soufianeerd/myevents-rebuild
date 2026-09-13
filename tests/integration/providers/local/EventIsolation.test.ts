import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalEventRepository } from '@/providers/local/LocalEventRepository';
import { LocalWorkspaceRepository } from '@/providers/local/LocalWorkspaceRepository';
import { GetOrCreateWorkspaceUseCase } from '@/core/workspaces/usecases/GetOrCreateWorkspaceUseCase';
import { CreateEventUseCase } from '@/core/events/usecases/CreateEventUseCase';
import { UpdateEventBasicsUseCase } from '@/core/events/usecases/UpdateEventBasicsUseCase';
import { SoftDeleteEventUseCase } from '@/core/events/usecases/SoftDeleteEventUseCase';
import { createId } from '@/core/ids';
import type { AccessContext } from '@/core/access/access';
import { randomUUID } from 'node:crypto';

describe('Persisted event authorization and workspace concurrency', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'myevents-events-'));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  const owner: AccessContext = {
    kind: 'user',
    userId: createId('owner'),
    tenantId: createId('tenant-a'),
  };
  const stranger: AccessContext = {
    kind: 'user',
    userId: createId('other'),
    tenantId: createId('tenant-b'),
  };
  const clock = { now: () => new Date('2026-01-01T00:00:00Z') };
  const ids = { generate: () => randomUUID() };
  it('concurrent containers create only one primary workspace per tenant', async () => {
    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        new GetOrCreateWorkspaceUseCase(
          new LocalWorkspaceRepository(dir),
          ids,
          clock,
        ).execute(owner),
      ),
    );
    expect(new Set(results.map((r) => r.ok && r.value.id)).size).toBe(1);
    expect(
      await new LocalWorkspaceRepository(dir).findByTenantId(
        createId('tenant-a'),
      ),
    ).toHaveLength(1);
  });
  it('blocks another tenant from reading, updating or deleting; owner can edit and soft-delete', async () => {
    const repo = new LocalEventRepository(dir);
    const workspaces = new GetOrCreateWorkspaceUseCase(
      new LocalWorkspaceRepository(dir),
      ids,
      clock,
    );
    const created = await new CreateEventUseCase(
      repo,
      workspaces,
      ids,
      clock,
    ).execute(owner, {
      name: 'Privé',
      type: 'wedding',
      startAt: '2026-10-01T12:00',
      timezone: 'Europe/Paris',
      defaultLanguage: 'fr',
    });
    if (!created.ok) throw new Error('Fixture failed');
    const event = created.value;
    const edit = new UpdateEventBasicsUseCase(repo, clock);
    const remove = new SoftDeleteEventUseCase(repo, clock);
    expect(await repo.findById(event.id, createId('tenant-b'))).toBeNull();
    expect(
      (await edit.execute(stranger, event.id, { name: 'Attacked' })).ok,
    ).toBe(false);
    expect((await remove.execute(stranger, event.id)).ok).toBe(false);
    expect(
      (
        await edit.execute(owner, event.id, {
          name: 'Modifié',
          endAt: '2026-10-01T13:00',
        })
      ).ok,
    ).toBe(true);
    expect((await repo.findById(event.id, event.tenantId))?.name).toBe(
      'Modifié',
    );
    expect(
      (await edit.execute(owner, event.id, { endAt: '2026-09-01T12:00' })).ok,
    ).toBe(false);
    expect((await remove.execute(owner, event.id)).ok).toBe(true);
    expect(await repo.findById(event.id, event.tenantId)).toBeNull();
    expect(
      await repo.findByWorkspaceId(event.workspaceId, event.tenantId),
    ).toEqual([]);
  });
});
