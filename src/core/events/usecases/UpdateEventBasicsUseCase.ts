import type { Event } from '../models';
import { eventBasicsSchema } from '../validation';
import type { EventRepository, Clock } from '../../../providers/contracts';
import type { AccessContext } from '../../access/access';
import { requireAuthentication } from '../../access/access';
import { Result, ok, err } from '../../result';
import { AppError, createAppError } from '../../errors';
import type { EventId } from '../../ids';

export interface UpdateEventBasicsInput {
  name?: string;
  startAt?: string;
  endAt?: string;
  timezone?: string;
  defaultLanguage?: string;
  estimatedGuestCount?: number;
  primaryLocation?: string;
}

export class UpdateEventBasicsUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    context: AccessContext,
    eventId: EventId,
    input: UpdateEventBasicsInput,
  ): Promise<Result<Event, AppError>> {
    const authResult = requireAuthentication(context);
    if (!authResult.ok) {
      return err(authResult.error);
    }
    const userContext = authResult.value;

    const event = await this.eventRepository.findById(
      eventId,
      userContext.tenantId,
    );

    if (!event) {
      return err(
        createAppError('NOT_FOUND', 'Event not found or access denied.'),
      );
    }

    const updatedEvent: Event = {
      ...event,
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.startAt !== undefined ? { startAt: input.startAt } : {}),
      ...(input.endAt !== undefined ? { endAt: input.endAt } : {}),
      ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      ...(input.defaultLanguage !== undefined
        ? { defaultLanguage: input.defaultLanguage }
        : {}),
      ...(input.estimatedGuestCount !== undefined
        ? { estimatedGuestCount: input.estimatedGuestCount }
        : {}),
      ...(input.primaryLocation !== undefined
        ? { primaryLocation: input.primaryLocation }
        : {}),
      updatedAt: this.clock.now().toISOString(),
    };

    const parsed = eventBasicsSchema.safeParse(updatedEvent);
    if (!parsed.success)
      return err(
        createAppError('VALIDATION_ERROR', parsed.error.issues[0].message),
      );
    Object.assign(updatedEvent, parsed.data);
    await this.eventRepository.update(updatedEvent);

    return ok(updatedEvent);
  }
}
