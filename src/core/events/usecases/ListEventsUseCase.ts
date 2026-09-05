import type { Event } from '../models';
import type { EventRepository } from '../../../providers/contracts';
import type { AccessContext } from '../../access/access';
import { requireAuthentication } from '../../access/access';
import { Result, ok, err } from '../../result';
import type { AppError } from '../../errors';
import { GetOrCreateWorkspaceUseCase } from '../../workspaces/usecases/GetOrCreateWorkspaceUseCase';

export class ListEventsUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly getOrCreateWorkspace: GetOrCreateWorkspaceUseCase,
  ) {}

  async execute(context: AccessContext): Promise<Result<Event[], AppError>> {
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

    const events = await this.eventRepository.findByWorkspaceId(
      workspace.id,
      userContext.tenantId,
    );

    // Sort by startAt DESC (or let UI handle it, but simple sorting is fine here)
    const sorted = events.sort(
      (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
    );

    return ok(sorted);
  }
}
