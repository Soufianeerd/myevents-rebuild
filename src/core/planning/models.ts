import { z } from 'zod';
const text = z.string().trim().max(4000).default('');
const label = z.string().trim().min(1).max(180);
const date = z.union([z.literal(''), z.iso.date()]).default('');
const money = z.number().int().min(0).max(1000000000).default(0);
const files = z.array(z.uuid()).max(20).default([]);
export const taskSchema = z.object({
  id: z.uuid(),
  title: label,
  description: text,
  responsible: z.string().max(150).default(''),
  category: z.string().max(100).default(''),
  date,
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  status: z.enum(['todo', 'doing', 'blocked', 'done']).default('todo'),
  notes: text,
  attachments: files,
});
export const budgetLineSchema = z.object({
  id: z.uuid(),
  title: label,
  category: z.string().max(100).default(''),
  supplier: z.string().max(180).default(''),
  planned: money,
  actual: money,
  deposit: money,
  paid: money,
  due: date,
  status: z.enum(['planned', 'committed', 'paid']).default('planned'),
  notes: text,
  attachments: files,
});
export const supplierSchema = z.object({
  id: z.uuid(),
  name: label,
  category: z.string().max(100).default(''),
  contact: z.string().max(150).default(''),
  phone: z.string().max(50).default(''),
  email: z.union([z.literal(''), z.email()]).default(''),
  price: money,
  deposit: money,
  due: date,
  notes: text,
  attachments: files,
});
export const venueSchema = z.object({
  id: z.uuid(),
  name: label,
  address: z.string().max(500).default(''),
  capacity: z.number().int().min(0).max(1000000).default(0),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
  notes: text,
});
export const momentSchema = z
  .object({
    id: z.uuid(),
    title: label,
    start: z.iso.datetime(),
    end: z.iso.datetime(),
    venueId: z.union([z.literal(''), z.uuid()]).default(''),
    visibility: z.enum(['private', 'public', 'invited']).default('public'),
    description: text,
  })
  .refine(
    (m) => new Date(m.end) >= new Date(m.start),
    'La fin doit suivre le début.',
  );
export const noteSchema = z.object({ id: z.uuid(), title: label, text });
export const planningSchema = z
  .object({
    tasks: z.array(taskSchema).max(1000).default([]),
    budget: z.array(budgetLineSchema).max(1000).default([]),
    suppliers: z.array(supplierSchema).max(500).default([]),
    venues: z.array(venueSchema).max(100).default([]),
    moments: z.array(momentSchema).max(500).default([]),
    notes: z.array(noteSchema).max(500).default([]),
  })
  .superRefine((doc, ctx) => {
    for (const [kind, items] of Object.entries(doc))
      if (new Set(items.map((i) => i.id)).size !== items.length)
        ctx.addIssue({
          code: 'custom',
          message: `Identifiants dupliqués : ${kind}`,
        });
    for (const moment of doc.moments)
      if (moment.venueId && !doc.venues.some((v) => v.id === moment.venueId))
        ctx.addIssue({
          code: 'custom',
          message: 'Un lieu du programme est introuvable.',
        });
  });
export type Planning = z.infer<typeof planningSchema>;
export type PlanningKind = keyof Planning;
export interface PlanningRecord {
  eventId: string;
  tenantId: string;
  document: Planning;
  revision: number;
  updatedAt: string;
}
export function budgetSummary(lines: Planning['budget']) {
  const planned = lines.reduce((s, l) => s + l.planned, 0),
    actual = lines.reduce((s, l) => s + l.actual, 0),
    paid = lines.reduce((s, l) => s + l.paid, 0);
  return {
    planned,
    actual,
    paid,
    remaining: Math.max(0, actual - paid),
    overrun: Math.max(0, actual - planned),
  };
}
export function taskSummary(tasks: Planning['tasks']) {
  const done = tasks.filter((t) => t.status === 'done').length;
  return {
    total: tasks.length,
    done,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
  };
}
