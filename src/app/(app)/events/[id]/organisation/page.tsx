import { planningState } from '@/server/planning/service';
import { Organisation } from './Organisation';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = await planningState(id);
  return (
    <Organisation
      eventId={id}
      eventName={state.event.name}
      timezone={state.event.timezone}
      initial={state.document}
      revision={state.revision}
    />
  );
}
