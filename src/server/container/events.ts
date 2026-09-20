import { env } from '@/lib/env';
import type {
  EventRepository,
  WorkspaceRepository,
  Clock,
  IdGenerator,
} from '@/providers/contracts';

interface EventContainer {
  eventRepository: EventRepository;
  workspaceRepository: WorkspaceRepository;
  clock: Clock;
  idGenerator: IdGenerator;
}

export async function createEventContainer(): Promise<EventContainer> {
  if (env.APP_MODE === 'local') {
    const { createContainer } = await import('./createContainer');
    return createContainer();
  }
  if (env.CONNECTED_PROVIDER === 'neon') {
    const { authenticatedNeonDatabase } = await import('@/server/neon/auth');
    const { NeonEventRepository } =
      await import('@/providers/neon/NeonEventRepository');
    const { NeonWorkspaceRepository } =
      await import('@/providers/neon/NeonWorkspaceRepository');
    const db = await authenticatedNeonDatabase();
    return {
      eventRepository: new NeonEventRepository(db),
      workspaceRepository: new NeonWorkspaceRepository(db),
      clock: { now: () => new Date() },
      idGenerator: { generate: () => crypto.randomUUID() },
    };
  }
  // A request-scoped client carries the authenticated user's JWT, never a service role key.
  const { createSupabaseServerClient } =
    await import('@/server/supabase/client');
  const { SupabaseEventRepository } =
    await import('@/providers/supabase/SupabaseEventRepository');
  const { SupabaseWorkspaceRepository } =
    await import('@/providers/supabase/SupabaseWorkspaceRepository');
  const client = await createSupabaseServerClient();
  return {
    eventRepository: new SupabaseEventRepository(client),
    workspaceRepository: new SupabaseWorkspaceRepository(client),
    clock: { now: () => new Date() },
    idGenerator: { generate: () => crypto.randomUUID() },
  };
}
