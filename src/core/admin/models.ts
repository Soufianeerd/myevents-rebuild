import { z } from 'zod';

/** Processing stages of a physical print request, after its submission. */
export const printStages = [
  'requested',
  'quote_sent',
  'accepted',
  'in_production',
  'shipped',
  'declined',
] as const;
export type PrintStage = (typeof printStages)[number];
export const printStageLabels: Record<PrintStage, string> = {
  requested: 'Demande reçue',
  quote_sent: 'Devis envoyé',
  accepted: 'Devis accepté',
  in_production: 'En fabrication',
  shipped: 'Expédiée',
  declined: 'Refusée',
};

/** Stages an operator may record; `requested` is the implicit first stage. */
export const stageUpdateSchema = z
  .object({
    requestId: z.uuid(),
    stage: z.enum(printStages).exclude(['requested']),
    note: z.string().trim().max(1000).default(''),
  })
  .strict();
export type StageUpdate = z.infer<typeof stageUpdateSchema>;

const isoDate = z.union([z.iso.datetime({ offset: true }), z.string()]);
export const operatorOverviewSchema = z.object({
  totals: z.object({
    accounts: z.coerce.number().int().min(0),
    events: z.coerce.number().int().min(0),
    paidOrders: z.coerce.number().int().min(0),
    revenueCents: z.coerce.number().int().min(0),
  }),
  orders: z.array(
    z.object({
      id: z.string(),
      eventId: z.string(),
      eventName: z.string(),
      offerName: z.string(),
      amount: z.number().int(),
      status: z.enum(['pending', 'paid', 'refunded']),
      createdAt: isoDate,
      paidAt: isoDate.nullable(),
    }),
  ),
  requests: z.array(
    z.object({
      id: z.string(),
      eventId: z.string(),
      eventName: z.string(),
      material: z.string(),
      finish: z.string(),
      quantity: z.number().int(),
      notes: z.string(),
      createdAt: isoDate,
      stage: z.enum(printStages),
      stageNote: z.string(),
    }),
  ),
});
export type OperatorOverview = z.infer<typeof operatorOverviewSchema>;

/** Operators are listed explicitly by confirmed e-mail address. */
export function isOperator(
  email: string | null | undefined,
  allowList: string | undefined,
) {
  if (!email || !allowList) return false;
  const normalized = email.trim().toLowerCase();
  return allowList
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalized);
}
