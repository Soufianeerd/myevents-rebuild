import { env } from '@/lib/env';
import { isOperator, stageUpdateSchema } from '@/core/admin/models';
import { getCurrentSafeUser } from '@/server/auth/getCurrentAccessContext';
import { eventScope } from '@/server/experience/service';
import type { OperatorRepository } from '@/providers/contracts/OperatorRepository';

async function operatorRepository(
  withTenant: boolean,
): Promise<OperatorRepository> {
  if (env.APP_MODE === 'local') {
    const { LocalOperatorRepository } =
      await import('@/providers/local/LocalOperatorRepository');
    return new LocalOperatorRepository(env.LOCAL_DATA_DIR);
  }
  if (env.CONNECTED_PROVIDER !== 'neon')
    throw new Error('Cette fonctionnalité nécessite Neon.');
  const [{ NeonOperatorRepository }, { scopedNeonDatabase }] =
    await Promise.all([
      import('@/providers/neon/NeonOperatorRepository'),
      import('@/server/neon/database'),
    ]);
  const tenant = withTenant
    ? await (await import('@/server/neon/auth')).authenticatedNeonDatabase()
    : null;
  return new NeonOperatorRepository(
    scopedNeonDatabase(null),
    tenant,
    process.env.OPERATOR_SECRET,
  );
}

/** Returns the operator e-mail, or null when the visitor is not an operator. */
export async function currentOperator() {
  const user = await getCurrentSafeUser();
  return user && isOperator(user.email, process.env.OPERATOR_EMAILS)
    ? user.email
    : null;
}
async function requireOperator() {
  const operator = await currentOperator();
  if (!operator) throw new Error('Accès réservé à l’équipe MyEvents.');
  return operator;
}

export async function operatorOverview() {
  await requireOperator();
  return (await operatorRepository(false)).overview();
}

export async function setPrintStage(input: unknown) {
  await requireOperator();
  await (
    await operatorRepository(false)
  ).setStage(stageUpdateSchema.parse(input));
}

/** Owner view: processing stage of the event's print requests. */
export async function printRequestStages(eventId: string) {
  const { event, context } = await eventScope(eventId);
  return (await operatorRepository(true)).latestStages(
    event.id,
    context.tenantId,
  );
}
