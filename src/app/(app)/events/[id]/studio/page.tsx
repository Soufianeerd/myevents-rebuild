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
      eventId={id}
      initial={state.document}
      initialRevision={state.record?.revision ?? 0}
      history={state.record?.history ?? []}
      publicUrl={state.publicUrl}
      canPublish={state.products.includes('invitation')}
    />
  );
}
