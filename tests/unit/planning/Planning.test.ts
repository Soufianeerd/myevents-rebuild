import { it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  planningSchema,
  budgetSummary,
  taskSummary,
} from '@/core/planning/models';
it('calculates budget and progress from actual stored items without floating currency errors', () => {
  const doc = planningSchema.parse({
    tasks: [
      { id: randomUUID(), title: 'Lieu', status: 'done' },
      { id: randomUUID(), title: 'Traiteur', status: 'blocked' },
    ],
    budget: [
      {
        id: randomUUID(),
        title: 'Lieu',
        planned: 10000,
        actual: 12000,
        paid: 3500,
      },
    ],
  });
  expect(budgetSummary(doc.budget)).toEqual({
    planned: 10000,
    actual: 12000,
    paid: 3500,
    remaining: 8500,
    overrun: 2000,
  });
  expect(taskSummary(doc.tasks)).toEqual({
    total: 2,
    done: 1,
    percent: 50,
    blocked: 1,
  });
});
it('rejects invalid money, duplicate tasks and moments referring to missing venues', () => {
  const id = randomUUID();
  expect(() =>
    planningSchema.parse({
      tasks: [
        { id, title: 'A' },
        { id, title: 'B' },
      ],
    }),
  ).toThrow();
  expect(() =>
    planningSchema.parse({ budget: [{ id, title: 'Budget', paid: -1 }] }),
  ).toThrow();
  expect(() =>
    planningSchema.parse({
      moments: [
        {
          id,
          title: 'Cérémonie',
          start: '2027-06-12T10:00:00Z',
          end: '2027-06-12T09:00:00Z',
        },
      ],
    }),
  ).toThrow();
  expect(() =>
    planningSchema.parse({
      moments: [
        {
          id,
          title: 'Cérémonie',
          start: '2027-06-12T10:00:00Z',
          end: '2027-06-12T11:00:00Z',
          venueId: randomUUID(),
        },
      ],
    }),
  ).toThrow();
});
