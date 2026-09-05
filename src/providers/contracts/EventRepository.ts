import type { Event } from '../../core/events/models';
import type { EventId, WorkspaceId, TenantId } from '../../core/ids';

export interface EventRepository {
  create(event: Event): Promise<void>;

  // Always enforce tenant isolation
  findById(id: EventId, tenantId: TenantId): Promise<Event | null>;

  findByWorkspaceId(
    workspaceId: WorkspaceId,
    tenantId: TenantId,
  ): Promise<Event[]>;

  update(event: Event): Promise<void>;
}
