import { z } from 'zod';
import { LocalJsonStore } from './persistence/LocalJsonStore';
import { LocalEventRepository } from './LocalEventRepository';
import type { ExperienceRepository } from '../contracts/ExperienceRepository';
import type {
  InvitationDocument,
  InvitationRecord,
  RsvpResponse,
} from '@/core/invitations/models';
import {
  productsFromOrders,
  productKeys,
  type ProductKey,
  assertProduct,
  type Order,
} from '@/core/commerce/catalog';
interface State {
  invitations: Record<string, InvitationRecord>;
  links: Record<string, string>;
  responses: Record<string, Array<RsvpResponse & { createdAt: string }>>;
  orders: Order[];
  previews?: string[];
}
const empty = (): State => ({
  invitations: {},
  links: {},
  responses: {},
  orders: [],
});
export class LocalExperienceRepository implements ExperienceRepository {
  private store: LocalJsonStore<State>;
  private events: LocalEventRepository;
  constructor(directory: string) {
    this.store = new LocalJsonStore({
      baseDir: directory,
      collectionName: 'experience',
      schema: z.custom<State>(
        (v) =>
          !!v && typeof v === 'object' && 'invitations' in v && 'orders' in v,
      ),
    });
    this.events = new LocalEventRepository(directory);
  }
  private async requireEvent(id: string, tenant: string) {
    if (!(await this.events.findById(id as never, tenant as never)))
      throw new Error('Événement introuvable.');
  }
  async entitlements(id: string, tenant: string): Promise<ProductKey[]> {
    await this.requireEvent(id, tenant);
    const state = await this.store.read();
    return state?.previews?.includes(id)
      ? [...productKeys]
      : productsFromOrders(
          (state?.orders ?? []).filter(
            (o) => o.eventId === id && o.tenantId === tenant,
          ),
        );
  }
  async activatePreview(id: string, tenant: string) {
    await this.requireEvent(id, tenant);
    await this.store.update((data) => {
      const state = data ?? empty();
      state.previews = [...new Set([...(state.previews ?? []), id])];
      return state;
    });
  }
  async get(id: string, tenant: string) {
    await this.requireEvent(id, tenant);
    const record = (await this.store.read())?.invitations[id];
    return record?.tenantId === tenant ? record : null;
  }
  async save(
    id: string,
    tenant: string,
    draft: InvitationDocument,
    revision: number,
    now: string,
  ) {
    await this.requireEvent(id, tenant);
    let result!: InvitationRecord;
    await this.store.update((data) => {
      const state = data || empty();
      const old = state.invitations[id];
      if ((old?.revision ?? 0) !== revision || (old && old.tenantId !== tenant))
        throw new Error(
          'Une autre version a été enregistrée. Rechargez le Studio.',
        );
      result = {
        eventId: id,
        tenantId: tenant,
        draft,
        published: old?.published ?? null,
        publishedAt: old?.publishedAt ?? null,
        publishedRevision: old?.publishedRevision ?? null,
        revision: revision + 1,
        history: [
          ...(old?.history ?? []),
          { revision: revision + 1, createdAt: now, document: draft },
        ],
        updatedAt: now,
      };
      state.invitations[id] = result;
      return state;
    });
    return result;
  }
  async publish(
    id: string,
    tenant: string,
    revision: number,
    tokenHash: string,
    now: string,
  ) {
    await this.requireEvent(id, tenant);
    await this.store.update((data) => {
      const state = data || empty(),
        record = state.invitations[id];
      if (!record || record.tenantId !== tenant || record.revision !== revision)
        throw new Error('Rechargez le Studio avant de publier.');
      assertProduct(
        state.previews?.includes(id)
          ? [...productKeys]
          : productsFromOrders(
              state.orders.filter(
                (o) => o.eventId === id && o.tenantId === tenant,
              ),
            ),
        'invitation',
      );
      record.published = structuredClone(record.draft);
      record.publishedAt = now;
      record.publishedRevision = revision;
      for (const [token, event] of Object.entries(state.links))
        if (event === id) delete state.links[token];
      state.links[tokenHash] = id;
      return state;
    });
  }
  async suspend(id: string, tenant: string) {
    await this.requireEvent(id, tenant);
    await this.store.update((data) => {
      const state = data || empty(),
        record = state.invitations[id];
      if (record?.tenantId === tenant) {
        record.published = null;
        for (const [token, event] of Object.entries(state.links))
          if (event === id) delete state.links[token];
      }
      return state;
    });
  }
  async getPublic(hash: string) {
    const state = await this.store.read();
    const record = state?.invitations[state.links[hash]];
    if (
      !record?.published ||
      !(await this.events.findById(
        record.eventId as never,
        record.tenantId as never,
      ))
    )
      return null;
    return {
      eventId: record.eventId,
      document: record.published,
      revision: record.publishedRevision!,
    };
  }
  async respond(
    hash: string,
    response: RsvpResponse,
    revision: number,
    now: string,
  ) {
    const publicDoc = await this.getPublic(hash);
    if (!publicDoc || publicDoc.revision !== revision)
      throw new Error('Invitation modifiée, rechargez la page.');
    await this.store.update((data) => {
      const state = data || empty();
      const record = state.invitations[publicDoc.eventId];
      if (!record?.published || state.links[hash] !== record.eventId)
        throw new Error('Invitation indisponible.');
      const rows = state.responses[record.eventId] ?? [];
      if (!rows.some((r) => r.id === response.id))
        rows.push({ ...response, createdAt: now });
      state.responses[record.eventId] = rows;
      return state;
    });
  }
  async responses(id: string, tenant: string) {
    await this.requireEvent(id, tenant);
    return (await this.store.read())?.responses[id] ?? [];
  }
  async orders(id: string, tenant: string) {
    await this.requireEvent(id, tenant);
    return ((await this.store.read())?.orders ?? []).filter(
      (o) => o.eventId === id && o.tenantId === tenant,
    );
  }
  async createOrder(order: Order) {
    await this.requireEvent(order.eventId, order.tenantId);
    await this.store.update((data) => {
      const state = data || empty();
      if (!state.orders.some((o) => o.id === order.id))
        state.orders.push(order);
      return state;
    });
  }
  async attachSession(id: string, tenant: string, sessionId: string) {
    await this.store.update((data) => {
      const state = data || empty();
      const order = state.orders.find(
        (o) => o.id === id && o.tenantId === tenant,
      );
      if (
        !order ||
        order.status !== 'pending' ||
        (order.sessionId && order.sessionId !== sessionId)
      )
        throw new Error('Commande indisponible.');
      order.sessionId = sessionId;
      return state;
    });
  }
  async fulfill(
    id: string,
    sessionId: string,
    amount: number,
    now: string,
    _secret: string,
  ) {
    void _secret;
    await this.store.update((data) => {
      const state = data || empty();
      const order = state.orders.find(
        (o) => o.id === id && o.sessionId === sessionId,
      );
      if (
        !order ||
        order.offer.amount !== amount ||
        order.status === 'refunded'
      )
        throw new Error('Paiement incompatible.');
      order.status = 'paid';
      order.paidAt = order.paidAt ?? now;
      return state;
    });
  }
}
