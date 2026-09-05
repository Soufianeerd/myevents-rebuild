import { z } from 'zod';
import type { EventRepository } from '../contracts/EventRepository';
import type { Event, EventLifecycleStatus } from '../../core/events/models';
import type { EventId, WorkspaceId, TenantId, UserId } from '../../core/ids';
import { LocalJsonStore } from './persistence/LocalJsonStore';

const EventSchema = z.object({
  id: z.string().transform((val) => val as EventId),
  workspaceId: z.string().transform((val) => val as WorkspaceId),
  tenantId: z.string().transform((val) => val as TenantId),
  createdBy: z.string().transform((val) => val as UserId),
  type: z.string(),
  name: z.string(),
  startAt: z.string(),
  endAt: z.string().optional(),
  timezone: z.string(),
  primaryLocation: z.string().optional(),
  defaultLanguage: z.string(),
  estimatedGuestCount: z.number().optional(),
  lifecycleStatus: z
    .enum(['draft', 'published', 'archived'] as const)
    .transform((val) => val as EventLifecycleStatus),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
});

const EventsSchema = z.record(z.string(), EventSchema);
type EventsMap = z.infer<typeof EventsSchema>;

export class LocalEventRepository implements EventRepository {
  private store: LocalJsonStore<EventsMap>;

  constructor(dataDir: string) {
    this.store = new LocalJsonStore<EventsMap>({
      baseDir: dataDir,
      collectionName: 'events',
      schema: EventsSchema,
    });
  }

  async create(event: Event): Promise<void> {
    await this.store.update((data) => {
      const events = data || {};
      if (events[event.id]) {
        throw new Error(`Event with id ${event.id} already exists`);
      }
      events[event.id] = event;
      return events;
    });
  }

  async findById(id: EventId, tenantId: TenantId): Promise<Event | null> {
    const events = (await this.store.read()) || {};
    const event = events[id];

    if (event && event.tenantId === tenantId && !event.deletedAt) {
      return event;
    }
    return null;
  }

  async findByWorkspaceId(
    workspaceId: WorkspaceId,
    tenantId: TenantId,
  ): Promise<Event[]> {
    const events = (await this.store.read()) || {};
    return Object.values(events).filter(
      (e) =>
        e.workspaceId === workspaceId &&
        e.tenantId === tenantId &&
        !e.deletedAt,
    );
  }

  async update(event: Event): Promise<void> {
    await this.store.update((data) => {
      const events = data || {};
      const existing = events[event.id];
      if (existing && existing.tenantId === event.tenantId) {
        events[event.id] = event;
      }
      return events;
    });
  }
}
