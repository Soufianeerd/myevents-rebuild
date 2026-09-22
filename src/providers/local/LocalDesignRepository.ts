import { z } from 'zod';
import { LocalJsonStore } from './persistence/LocalJsonStore';
import { LocalEventRepository } from './LocalEventRepository';
import {
  designSchema,
  type Design,
  type DesignRecord,
} from '@/core/designs/models';
import type { DesignRepository } from '../contracts/DesignRepository';
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
  constructor(directory: string) {
    this.store = new LocalJsonStore({
      baseDir: directory,
      collectionName: 'designs',
      schema: z.record(z.string(), record),
    });
    this.events = new LocalEventRepository(directory);
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
