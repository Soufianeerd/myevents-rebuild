import { notFound } from 'next/navigation';
import { getEventAction } from '../../../actions/events/actions';
import type { EventId } from '@/core/ids';
import { EventForm } from '../../EventForm';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventAction(id as EventId);
  if (!event) notFound();
  return <EventForm initialEvent={event} />;
}
