'use client';
import { useActionState, useId } from 'react';
import { printStageLabels, printStages } from '@/core/admin/models';
import { setStageAction } from './actions';
export function StageForm({
  requestId,
  current,
}: {
  requestId: string;
  current: string;
}) {
  const [state, action, pending] = useActionState(setStageAction, {
    error: '',
    ok: false,
  });
  const id = useId();
  return (
    <form action={action}>
      <input type="hidden" name="requestId" value={requestId} />
      <label htmlFor={`${id}-stage`}>Nouvelle étape</label>{' '}
      <select id={`${id}-stage`} name="stage" defaultValue={current}>
        {printStages
          .filter((s) => s !== 'requested')
          .map((s) => (
            <option key={s} value={s}>
              {printStageLabels[s]}
            </option>
          ))}
      </select>{' '}
      <label htmlFor={`${id}-note`}>Note pour le client</label>{' '}
      <input id={`${id}-note`} name="note" maxLength={1000} />{' '}
      <button type="submit" disabled={pending}>
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      {state.error ? <p role="alert">{state.error}</p> : null}
      {state.ok ? <p role="status">Étape enregistrée.</p> : null}
    </form>
  );
}
