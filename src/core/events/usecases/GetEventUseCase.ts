import type { Event } from '../models';
import type { EventRepository } from '../../../providers/contracts';
import type { AccessContext } from '../../access/access';
import { requireAuthentication } from '../../access/access';
import { Result, ok, err } from '../../result';
import { AppError, createAppError } from '../../errors';
import type { EventId } from '../../ids';

export class GetEventUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(
    context: AccessContext,
    eventId: EventId,
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

    return ok(event);
  }
}
