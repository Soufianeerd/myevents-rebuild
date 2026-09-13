'use server';

import { revalidatePath } from 'next/cache';
import { createEventContainer } from '@/server/container/events';
import { getCurrentAccessContext } from '../../../../server/auth/getCurrentAccessContext';
import { createEventSchema, eventIdSchema } from './schemas';
import { UpdateEventBasicsUseCase } from '@/core/events/usecases/UpdateEventBasicsUseCase';
import { CreateEventUseCase } from '../../../../core/events/usecases/CreateEventUseCase';
import { ListEventsUseCase } from '../../../../core/events/usecases/ListEventsUseCase';
import { GetEventUseCase } from '../../../../core/events/usecases/GetEventUseCase';
import { SoftDeleteEventUseCase } from '../../../../core/events/usecases/SoftDeleteEventUseCase';
import { GetOrCreateWorkspaceUseCase } from '../../../../core/workspaces/usecases/GetOrCreateWorkspaceUseCase';
import type { EventId } from '../../../../core/ids';

async function eventUseCases() {
  const container = await createEventContainer();
  const workspace = new GetOrCreateWorkspaceUseCase(
    container.workspaceRepository,
    container.idGenerator,
    container.clock,
  );
  return {
    createEventUseCase: new CreateEventUseCase(
      container.eventRepository,
      workspace,
      container.idGenerator,
      container.clock,
    ),
    listEventsUseCase: new ListEventsUseCase(
      container.eventRepository,
      workspace,
    ),
    getEventUseCase: new GetEventUseCase(container.eventRepository),
    softDeleteEventUseCase: new SoftDeleteEventUseCase(
      container.eventRepository,
      container.clock,
    ),
    updateEventUseCase: new UpdateEventBasicsUseCase(
      container.eventRepository,
      container.clock,
    ),
  };
}

export async function createEventAction(formData: FormData) {
  const context = await getCurrentAccessContext();
  const { createEventUseCase } = await eventUseCases();

  const rawData = {
    type: formData.get('type') as string,
    name: formData.get('name') as string,
    startAt: formData.get('startAt') as string,
    endAt: (formData.get('endAt') as string) || undefined,
    timezone: formData.get('timezone') as string,
    defaultLanguage: formData.get('defaultLanguage') as string,
    estimatedGuestCount: formData.get('estimatedGuestCount')
      ? Number(formData.get('estimatedGuestCount'))
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
  const { listEventsUseCase } = await eventUseCases();
  const result = await listEventsUseCase.execute(context);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result.value;
}

export async function getEventAction(eventId: EventId) {
  const context = await getCurrentAccessContext();
  const { getEventUseCase } = await eventUseCases();
  if (!eventIdSchema.safeParse(eventId).success) return null;
  const result = await getEventUseCase.execute(context, eventId);

  if (!result.ok) {
    return null;
  }

  return result.value;
}

export async function softDeleteEventAction(eventId: EventId) {
  const context = await getCurrentAccessContext();
  const { softDeleteEventUseCase } = await eventUseCases();
  if (!eventIdSchema.safeParse(eventId).success)
    return { success: false, error: 'Événement introuvable.' };
  const result = await softDeleteEventUseCase.execute(context, eventId);

  if (!result.ok) {
    return { success: false, error: result.error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateEventAction(eventId: EventId, formData: FormData) {
  const context = await getCurrentAccessContext();
  const { getEventUseCase, updateEventUseCase } = await eventUseCases();
  if (!eventIdSchema.safeParse(eventId).success)
    return { success: false, error: 'Événement introuvable.' };
  const current = await getEventUseCase.execute(context, eventId);
  if (!current.ok) return { success: false, error: 'Événement introuvable.' };
  const parsed = createEventSchema.safeParse({
    type: current.value.type,
    name: formData.get('name'),
    startAt: formData.get('startAt'),
    endAt: formData.get('endAt') || undefined,
    timezone: formData.get('timezone'),
    defaultLanguage: formData.get('defaultLanguage'),
    primaryLocation: formData.get('primaryLocation') || '',
    estimatedGuestCount: formData.get('estimatedGuestCount')
      ? Number(formData.get('estimatedGuestCount'))
      : undefined,
  });
  if (!parsed.success)
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  const result = await updateEventUseCase.execute(context, eventId, {
    ...parsed.data,
    endAt: parsed.data.endAt || '',
  });
  if (!result.ok) return { success: false, error: result.error.message };
  revalidatePath('/dashboard');
  revalidatePath(`/events/${eventId}`);
  return { success: true, data: result.value };
}
