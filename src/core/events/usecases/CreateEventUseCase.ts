import type { Event } from '../models';
import type {
  EventRepository,
  IdGenerator,
  Clock,
} from '../../../providers/contracts';
import type { EventId } from '../../ids';
import type { AccessContext } from '../../access/access';
import { requireAuthentication } from '../../access/access';
import { Result, ok, err } from '../../result';
import type { AppError } from '../../errors';
import { GetOrCreateWorkspaceUseCase } from '../../workspaces/usecases/GetOrCreateWorkspaceUseCase';

export interface CreateEventInput {
  type: string;
  name: string;
  startAt: string;
  timezone: string;
  defaultLanguage: string;
  estimatedGuestCount?: number;
  primaryLocation?: string;
  endAt?: string;
}

export class CreateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly getOrCreateWorkspace: GetOrCreateWorkspaceUseCase,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(
    context: AccessContext,
    input: CreateEventInput,
  ): Promise<Result<Event, AppError>> {
    const authResult = requireAuthentication(context);
    if (!authResult.ok) {
      return err(authResult.error);
    }
    const userContext = authResult.value;

    const workspaceResult = await this.getOrCreateWorkspace.execute(context);
    if (!workspaceResult.ok) {
      return err(workspaceResult.error);
    }
    const workspace = workspaceResult.value;

    const now = this.clock.now().toISOString();

    const newEvent: Event = {
      id: this.idGenerator.generate() as EventId,
      workspaceId: workspace.id,
      tenantId: userContext.tenantId,
      createdBy: userContext.userId,
      type: input.type,
      name: input.name,
      startAt: input.startAt,
      endAt: input.endAt,
      timezone: input.timezone,
      defaultLanguage: input.defaultLanguage,
      estimatedGuestCount: input.estimatedGuestCount,
      primaryLocation: input.primaryLocation,
      lifecycleStatus: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    await this.eventRepository.create(newEvent);

    // Note: We might also want to create an EventMember for the owner here later.

    return ok(newEvent);
  }
}
