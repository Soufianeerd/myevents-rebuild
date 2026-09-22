import type { Planning, PlanningRecord } from '@/core/planning/models';
export interface PlanningRepository {
  get(eventId: string, tenantId: string): Promise<PlanningRecord | null>;
  save(
    eventId: string,
    tenantId: string,
    document: Planning,
    revision: number,
  ): Promise<PlanningRecord>;
}
