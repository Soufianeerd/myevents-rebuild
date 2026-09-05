'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/Button';
import { softDeleteEventAction } from '../../actions/events/actions';
import type { EventId } from '../../../../core/ids';

export function DeleteEventButton({ eventId }: { eventId: EventId }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleDelete() {
    if (
      confirm(
        'Voulez-vous vraiment supprimer cet événement ? Cette action est irréversible.',
      )
    ) {
      startTransition(async () => {
        const result = await softDeleteEventAction(eventId);
        if (result.success) {
          router.push('/dashboard');
        } else {
          alert('Erreur lors de la suppression : ' + result.error);
        }
      });
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={handleDelete}
      loading={isPending}
      disabled={isPending}
    >
      Supprimer
    </Button>
  );
}
