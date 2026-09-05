import type { EventRepository, Clock } from '../../../providers/contracts';
import type { AccessContext } from '../../access/access';
import { requireAuthentication } from '../../access/access';
import { Result, ok, err } from '../../result';
import { AppError, createAppError } from '../../errors';
import type { EventId } from '../../ids';

export class SoftDeleteEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    context: AccessContext,
    eventId: EventId,
  ): Promise<Result<void, AppError>> {
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

    const updatedEvent = {
      ...event,
      deletedAt: this.clock.now().toISOString(),
      updatedAt: this.clock.now().toISOString(),
    };

    await this.eventRepository.update(updatedEvent);

    return ok(undefined);
  }
}
