import { designState } from '@/server/designs/service';
import { paymentReady } from '@/server/payments/stripe';
import { testMaterials } from '@/core/designs/printing';
import { CardEditor } from './CardEditor';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <CardEditor
      eventId={id}
      initial={await designState(id)}
      materials={testMaterials}
      paymentAvailable={paymentReady()}
    />
  );
}
