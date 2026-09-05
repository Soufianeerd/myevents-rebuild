'use server';

import { revalidatePath } from 'next/cache';
import { createContainer } from '../../../../server/container/createContainer';
import { getCurrentAccessContext } from '../../../../server/auth/getCurrentAccessContext';
import { createEventSchema } from './schemas';
import { CreateEventUseCase } from '../../../../core/events/usecases/CreateEventUseCase';
import { ListEventsUseCase } from '../../../../core/events/usecases/ListEventsUseCase';
import { GetEventUseCase } from '../../../../core/events/usecases/GetEventUseCase';
import { SoftDeleteEventUseCase } from '../../../../core/events/usecases/SoftDeleteEventUseCase';
import { GetOrCreateWorkspaceUseCase } from '../../../../core/workspaces/usecases/GetOrCreateWorkspaceUseCase';
import type { EventId } from '../../../../core/ids';

const container = createContainer();

// Re-instantiate use cases here for server actions (or we could inject them in container)
const getOrCreateWorkspaceUseCase = new GetOrCreateWorkspaceUseCase(
  container.workspaceRepository,
  container.idGenerator,
  container.clock,
);

const createEventUseCase = new CreateEventUseCase(
  container.eventRepository,
  getOrCreateWorkspaceUseCase,
  container.idGenerator,
  container.clock,
);

const listEventsUseCase = new ListEventsUseCase(
  container.eventRepository,
  getOrCreateWorkspaceUseCase,
);

const getEventUseCase = new GetEventUseCase(container.eventRepository);

const softDeleteEventUseCase = new SoftDeleteEventUseCase(
  container.eventRepository,
  container.clock,
);

export async function createEventAction(formData: FormData) {
  const context = await getCurrentAccessContext();

  const rawData = {
    type: formData.get('type') as string,
    name: formData.get('name') as string,
    startAt: formData.get('startAt') as string,
    timezone: formData.get('timezone') as string,
    defaultLanguage: formData.get('defaultLanguage') as string,
    estimatedGuestCount: formData.get('estimatedGuestCount')
      ? parseInt(formData.get('estimatedGuestCount') as string, 10)
      : undefined,
    primaryLocation: (formData.get('primaryLocation') as string) || undefined,
  };

  const parsed = createEventSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const result = await createEventUseCase.execute(context, parsed.data);

  if (!result.ok) {
    return { success: false, error: result.error.message };
  }

  revalidatePath('/dashboard');
  return { success: true, data: result.value };
}

export async function listEventsAction() {
  const context = await getCurrentAccessContext();
  const result = await listEventsUseCase.execute(context);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result.value;
}

export async function getEventAction(eventId: EventId) {
  const context = await getCurrentAccessContext();
  const result = await getEventUseCase.execute(context, eventId);

  if (!result.ok) {
    return null;
  }

  return result.value;
}

export async function softDeleteEventAction(eventId: EventId) {
  const context = await getCurrentAccessContext();
  const result = await softDeleteEventUseCase.execute(context, eventId);

  if (!result.ok) {
    return { success: false, error: result.error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
