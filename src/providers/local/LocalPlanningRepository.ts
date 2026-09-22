import { z } from 'zod';
import { LocalJsonStore } from './persistence/LocalJsonStore';
import { LocalEventRepository } from './LocalEventRepository';
import {
  planningSchema,
  type Planning,
  type PlanningRecord,
} from '@/core/planning/models';
import type { PlanningRepository } from '../contracts/PlanningRepository';
const record = z.object({
  eventId: z.uuid(),
  tenantId: z.uuid(),
  document: planningSchema,
  revision: z.number().int().positive(),
  updatedAt: z.iso.datetime(),
});
export class LocalPlanningRepository implements PlanningRepository {
  private store: LocalJsonStore<Record<string, PlanningRecord>>;
  private events: LocalEventRepository;
  constructor(directory: string) {
    this.store = new LocalJsonStore({
      baseDir: directory,
      collectionName: 'planning',
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
  async save(id: string, tenant: string, document: Planning, revision: number) {
    await this.get(id, tenant);
    let result!: PlanningRecord;
    await this.store.update((data) => {
      const state = data ?? {};
      if ((state[id]?.revision ?? 0) !== revision)
        throw new Error(
          'L’organisation a été modifiée ailleurs. Rechargez la page.',
        );
      result = {
        eventId: id,
        tenantId: tenant,
        document: planningSchema.parse(document),
        revision: revision + 1,
        updatedAt: new Date().toISOString(),
      };
      state[id] = result;
      return state;
    });
    return result;
  }
}
