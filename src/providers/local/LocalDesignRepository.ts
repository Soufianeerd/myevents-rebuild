import { z } from 'zod';
import { LocalJsonStore } from './persistence/LocalJsonStore';
import { LocalEventRepository } from './LocalEventRepository';
import {
  designSchema,
  type Design,
  type DesignRecord,
} from '@/core/designs/models';
import type { DesignRepository } from '../contracts/DesignRepository';
import {
  materialRequestSchema,
  type MaterialRequest,
} from '@/core/designs/requests';
const record = z.object({
  eventId: z.uuid(),
  tenantId: z.uuid(),
  document: designSchema,
  revision: z.number().int().positive(),
  updatedAt: z.iso.datetime(),
});
export class LocalDesignRepository implements DesignRepository {
  private store: LocalJsonStore<Record<string, DesignRecord>>;
  private events: LocalEventRepository;
  private materialRequests: LocalJsonStore<MaterialRequest[]>;
  constructor(directory: string) {
    this.materialRequests = new LocalJsonStore({
      baseDir: directory,
      collectionName: 'material-requests',
      schema: z.array(materialRequestSchema),
    });
    this.store = new LocalJsonStore({
      baseDir: directory,
      collectionName: 'designs',
      schema: z.record(z.string(), record),
    });
    this.events = new LocalEventRepository(directory);
  }
  async requests(id: string, tenant: string) {
    await this.get(id, tenant);
    return ((await this.materialRequests.read()) ?? []).filter(
      (request) => request.eventId === id && request.tenantId === tenant,
    );
  }
  async requestMaterial(input: MaterialRequest) {
    const request = materialRequestSchema.parse(input);
    await this.get(request.eventId, request.tenantId);
    let result = request;
    await this.materialRequests.update((data) => {
      const requests = data ?? [];
      const existing = requests.find((item) => item.id === request.id);
      if (existing) {
        if (
          existing.eventId !== request.eventId ||
          existing.tenantId !== request.tenantId ||
          existing.revision !== request.revision ||
          existing.material !== request.material ||
          existing.quantity !== request.quantity ||
          existing.finish !== request.finish ||
          existing.notes !== request.notes
        )
          throw new Error(
            'Cette demande existe déjà avec un contenu différent.',
          );
        result = existing;
        return requests;
      }
      return [...requests, request];
    });
    return result;
  }
  async get(id: string, tenant: string) {
    if (!(await this.events.findById(id as never, tenant as never)))
      throw new Error('Événement introuvable.');
    const result = (await this.store.read())?.[id];
    return result?.tenantId === tenant ? result : null;
  }
  async save(id: string, tenant: string, document: Design, revision: number) {
    await this.get(id, tenant);
    let result!: DesignRecord;
    await this.store.update((data) => {
      const state = data ?? {};
      if ((state[id]?.revision ?? 0) !== revision)
        throw new Error('La carte a été modifiée ailleurs. Rechargez la page.');
      result = {
        eventId: id,
        tenantId: tenant,
        document: designSchema.parse(document),
        revision: revision + 1,
        updatedAt: new Date().toISOString(),
      };
      state[id] = result;
      return state;
    });
    return result;
  }
}
