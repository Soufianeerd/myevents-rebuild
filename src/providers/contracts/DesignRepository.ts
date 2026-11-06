import type { Design, DesignRecord } from '@/core/designs/models';
import type { MaterialRequest } from '@/core/designs/requests';
export interface DesignRepository {
  requests(eventId: string, tenantId: string): Promise<MaterialRequest[]>;
  requestMaterial(request: MaterialRequest): Promise<MaterialRequest>;
  get(eventId: string, tenantId: string): Promise<DesignRecord | null>;
  save(
    eventId: string,
    tenantId: string,
    document: Design,
    revision: number,
  ): Promise<DesignRecord>;
}
