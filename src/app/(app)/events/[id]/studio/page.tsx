import { studioState } from '@/server/experience/service';
import { Studio } from './Studio';
export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = await studioState(id);
  return (
    <Studio
      initialAssets={state.assets}
      initialMusicAssets={state.musicAssets}
      eventId={id}
      eventStart={state.event.startAt}
      eventTimezone={state.event.timezone}
      initial={state.document}
      initialRevision={state.record?.revision ?? 0}
      history={state.record?.history ?? []}
      publicUrl={state.publicUrl}
      canPublish={state.products.includes('invitation')}
    />
  );
}
