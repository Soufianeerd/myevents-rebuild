import { z } from 'zod';
import { env } from '@/lib/env';
import { planningSchema } from '@/core/planning/models';
import { eventScope } from '@/server/experience/service';
import { mediaRepository } from '@/server/media/service';
import type { PlanningRepository } from '@/providers/contracts/PlanningRepository';
async function repository(): Promise<PlanningRepository> {
  if (env.APP_MODE === 'local') {
    const { LocalPlanningRepository } =
      await import('@/providers/local/LocalPlanningRepository');
    return new LocalPlanningRepository(env.LOCAL_DATA_DIR);
  }
  if (env.CONNECTED_PROVIDER !== 'neon') throw new Error('Neon requis.');
  const { NeonPlanningRepository } =
    await import('@/providers/neon/NeonPlanningRepository');
  return new NeonPlanningRepository(
    await (await import('@/server/neon/auth')).authenticatedNeonDatabase(),
  );
}
export async function planningState(id: string) {
  const { event, context } = await eventScope(id);
  const record = await (await repository()).get(id, context.tenantId);
  return {
    event,
    record,
    document: record?.document ?? planningSchema.parse({}),
    revision: record?.revision ?? 0,
  };
}
export async function savePlanning(
  id: string,
  input: unknown,
  revision: unknown,
) {
  const document = planningSchema.parse(input);
  if (JSON.stringify(document).length > 1000000)
    throw new Error('Ce document est trop volumineux.');
  const { context } = await eventScope(id);
  const refs = [
    ...document.tasks,
    ...document.budget,
    ...document.suppliers,
  ].flatMap((i) => i.attachments);
  if (refs.length) {
    const media = await (await mediaRepository()).list(id, context.tenantId);
    if (
      refs.some(
        (ref) => !media.some((m) => m.id === ref && m.status === 'ready'),
      )
    )
      throw new Error('Une pièce jointe ne correspond pas à cet événement.');
  }
  return (await repository()).save(
    id,
    context.tenantId,
    document,
    z.number().int().min(0).parse(revision),
  );
}
