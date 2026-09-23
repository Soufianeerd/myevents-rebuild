'use client';
import { useState } from 'react';
import {
  beginImageAction,
  finishImageAction,
} from '@/app/(app)/events/[id]/studio/image-actions';
export function ImageUpload({
  eventId,
  onUploaded,
}: {
  eventId: string;
  onUploaded: (asset: { id: string; name: string; url: string }) => void;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  return (
    <div>
      <label>
        Importer ma photo
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setMessage('Import de la photo…');
            try {
              const result = await beginImageAction(eventId, {
                name: file.name,
                mime: file.type,
                size: file.size,
                author: 'Organisateur',
                consent: true,
              });
              if (!result.ok) throw new Error(result.error);
              const form = new FormData();
              Object.entries(result.data.fields).forEach(([key, value]) =>
                form.append(key, value),
              );
              form.append('file', file);
              const uploaded = await fetch(result.data.url, {
                method: 'POST',
                body: form,
              });
              if (!uploaded.ok)
                throw new Error('Transfert interrompu. Réessayez.');
              const complete = await finishImageAction(
                eventId,
                result.data.id,
                result.data.secret,
              );
              if (!complete.ok) throw new Error(complete.error);
              onUploaded(complete.asset);
              setMessage(
                'Photo importée. Elle sera visible après publication de l’invitation.',
              );
            } catch (error) {
              setMessage(
                error instanceof Error ? error.message : 'Import impossible.',
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      <p>
        JPEG, PNG, WebP ou GIF · 20 Mo maximum. Vos images restent privées tant
        que vous ne les publiez pas.
      </p>
      <p role="status">{message}</p>
    </div>
  );
}
