import { z } from 'zod';
import { LocalJsonStore } from './persistence/LocalJsonStore';
import { LocalEventRepository } from './LocalEventRepository';
import {
  guestBookSchema,
  type GuestBook,
  type GuestBookRecord,
} from '@/core/guests/models';
import type { GuestRepository } from '../contracts/GuestRepository';
const record = z.object({
  eventId: z.uuid(),
  tenantId: z.uuid(),
  document: guestBookSchema,
  revision: z.number().int().positive(),
  updatedAt: z.iso.datetime(),
});
export class LocalGuestRepository implements GuestRepository {
  private store: LocalJsonStore<Record<string, GuestBookRecord>>;
  private events: LocalEventRepository;
  constructor(directory: string) {
    this.store = new LocalJsonStore({
      baseDir: directory,
      collectionName: 'guests',
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
  async save(
    id: string,
    tenant: string,
    document: GuestBook,
    revision: number,
  ) {
    await this.get(id, tenant);
    let result!: GuestBookRecord;
    await this.store.update((data) => {
      const state = data ?? {};
      if ((state[id]?.revision ?? 0) !== revision)
        throw new Error(
          'La liste d’invités a été modifiée ailleurs. Rechargez la page.',
        );
      result = {
        eventId: id,
        tenantId: tenant,
        document: guestBookSchema.parse(document),
        revision: revision + 1,
        updatedAt: new Date().toISOString(),
      };
      state[id] = result;
      return state;
    });
    return result;
  }
}
