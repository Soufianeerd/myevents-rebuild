import type {
  OperatorOverview,
  PrintStage,
  StageUpdate,
} from '@/core/admin/models';
export interface RequestStage {
  requestId: string;
  stage: PrintStage;
  note: string;
  createdAt: string;
}
export interface OperatorRepository {
  /** Cross-tenant overview; callers must have verified operator rights. */
  overview(): Promise<OperatorOverview>;
  setStage(update: StageUpdate): Promise<void>;
  /** Latest stage of each request of an event, scoped to its tenant. */
  latestStages(eventId: string, tenantId: string): Promise<RequestStage[]>;
}
