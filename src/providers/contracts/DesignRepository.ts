import type { Design, DesignRecord } from '@/core/designs/models';
export interface DesignRepository {
  get(eventId: string, tenantId: string): Promise<DesignRecord | null>;
  save(
    eventId: string,
    tenantId: string,
    document: Design,
    revision: number,
  ): Promise<DesignRecord>;
}
