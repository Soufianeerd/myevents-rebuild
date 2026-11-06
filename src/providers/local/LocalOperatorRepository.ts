import { z } from 'zod';
import { LocalJsonStore } from './persistence/LocalJsonStore';
import {
  operatorOverviewSchema,
  printStages,
  stageUpdateSchema,
  type StageUpdate,
} from '@/core/admin/models';
import { materialRequestSchema } from '@/core/designs/requests';
import type { Order } from '@/core/commerce/catalog';
import type {
  OperatorRepository,
  RequestStage,
} from '../contracts/OperatorRepository';

const stageSchema = z.object({
  requestId: z.uuid(),
  tenantId: z.string(),
  stage: z.enum(printStages),
  note: z.string(),
  createdAt: z.string(),
});
type StoredStage = z.infer<typeof stageSchema>;
const loose = z.custom<Record<string, unknown>>(
  (v) => !!v && typeof v === 'object',
);

export class LocalOperatorRepository implements OperatorRepository {
  private stages: LocalJsonStore<StoredStage[]>;
  private requests;
  private experience;
  private events;
  private users;
  constructor(
    directory: string,
    private now = () => new Date(),
  ) {
    const store = <T>(collectionName: string, schema: z.ZodType<T>) =>
      new LocalJsonStore<T>({ baseDir: directory, collectionName, schema });
    this.stages = store('material-request-stages', z.array(stageSchema));
    this.requests = store('material-requests', z.array(materialRequestSchema));
    this.experience = store('experience', loose);
    this.events = store('events', loose);
    this.users = store('users', loose);
  }
  private latest(stages: StoredStage[], requestId: string) {
    return stages
      .filter((s) => s.requestId === requestId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }
  async overview() {
    const [stages, requests, experience, events, users] = await Promise.all([
      this.stages.read(),
      this.requests.read(),
      this.experience.read(),
      this.events.read(),
      this.users.read(),
    ]);
    const eventMap = (events ?? {}) as Record<
      string,
      { name: string; deletedAt?: string }
    >;
    const orders = ((experience?.orders as Order[] | undefined) ?? []).slice();
    const name = (id: string) => eventMap[id]?.name ?? 'Événement supprimé';
    const paid = orders.filter((o) => o.status === 'paid');
    return operatorOverviewSchema.parse({
      totals: {
        accounts: Object.keys(users ?? {}).length,
        events: Object.values(eventMap).filter((e) => !e.deletedAt).length,
        paidOrders: paid.length,
        revenueCents: paid.reduce((sum, o) => sum + o.offer.amount, 0),
      },
      orders: orders
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 200)
        .map((o) => ({
          id: o.id,
          eventId: o.eventId,
          eventName: name(o.eventId),
          offerName: o.offer.name,
          amount: o.offer.amount,
          status: o.status,
          createdAt: o.createdAt,
          paidAt: o.paidAt,
        })),
      requests: (requests ?? [])
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 200)
        .map((r) => {
          const last = this.latest(stages ?? [], r.id);
          return {
            id: r.id,
            eventId: r.eventId,
            eventName: name(r.eventId),
            material: r.material,
            finish: r.finish,
            quantity: r.quantity,
            notes: r.notes,
            createdAt: r.createdAt,
            stage: last?.stage ?? 'requested',
            stageNote: last?.note ?? '',
          };
        }),
    });
  }
  async setStage(input: StageUpdate) {
    const update = stageUpdateSchema.parse(input);
    const request = ((await this.requests.read()) ?? []).find(
      (r) => r.id === update.requestId,
    );
    if (!request) throw new Error('Demande introuvable.');
    await this.stages.update((data) => [
      ...(data ?? []),
      {
        requestId: request.id,
        tenantId: request.tenantId,
        stage: update.stage,
        note: update.note,
        createdAt: this.now().toISOString(),
      },
    ]);
  }
  async latestStages(eventId: string, tenantId: string) {
    const [stages, requests] = await Promise.all([
      this.stages.read(),
      this.requests.read(),
    ]);
    return (requests ?? [])
      .filter((r) => r.eventId === eventId && r.tenantId === tenantId)
      .flatMap((r): RequestStage[] => {
        const last = this.latest(
          (stages ?? []).filter((s) => s.tenantId === tenantId),
          r.id,
        );
        return last
          ? [
              {
                requestId: r.id,
                stage: last.stage,
                note: last.note,
                createdAt: last.createdAt,
              },
            ]
          : [];
      });
  }
}
