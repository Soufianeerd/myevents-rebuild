'use client';
import { useState, type FormEvent } from 'react';
import {
  materialRequestInputSchema,
  type MaterialRequest,
} from '@/core/designs/requests';
import { printStageLabels, type PrintStage } from '@/core/admin/models';
import { requestMaterialAction } from './actions';
import styles from '../workspace.module.css';
export function MaterialRequestForm({
  eventId,
  revision,
  disabled,
  initial,
  stages = {},
}: {
  eventId: string;
  revision: number;
  disabled: boolean;
  initial: MaterialRequest[];
  stages?: Record<string, { stage: PrintStage; note: string }>;
}) {
  const [requests, setRequests] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [requestId, setRequestId] = useState<string>();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form);
    const id = requestId ?? crypto.randomUUID();
    setRequestId(id);
    setBusy(true);
    setMessage('');
    try {
      const input = materialRequestInputSchema.safeParse({
        id,
        revision,
        material: data.get('material'),
        quantity: Number(data.get('quantity')),
        finish: data.get('finish'),
        notes: data.get('notes'),
      });
      if (!input.success)
        throw new Error(
          'Indiquez un matériau et une quantité entre 1 et 10 000.',
        );
      const result = await requestMaterialAction(eventId, input.data);
      if (!result.ok) throw new Error(result.error);
      setRequests((items) => [
        result.request,
        ...items.filter((item) => item.id !== result.request.id),
      ]);
      setRequestId(undefined);
      form.reset();
      setMessage(
        'Demande enregistrée. La faisabilité et le tarif doivent être validés avant toute commande.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Connexion interrompue. Réessayez.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.card}>
      <h2>Demander une impression sur mesure</h2>
      <p>
        Papier, carton, plexiglas ou autre matériau : décrivez votre besoin.
        Cette demande ne déclenche ni paiement ni fabrication.
      </p>
      <form onSubmit={submit} onChange={() => setRequestId(undefined)}>
        <fieldset disabled={disabled || busy} style={{ border: 0, padding: 0 }}>
          <div className={styles.grid}>
            <label>
              Matériau souhaité
              <input
                name="material"
                required
                minLength={2}
                maxLength={150}
                placeholder="Par exemple : plexiglas transparent"
              />
            </label>
            <label>
              Quantité souhaitée
              <input
                name="quantity"
                type="number"
                required
                min={1}
                max={10000}
                defaultValue={50}
              />
            </label>
            <label>
              Finition souhaitée
              <input name="finish" maxLength={150} placeholder="Facultatif" />
            </label>
            <label>
              Précisions
              <textarea name="notes" maxLength={2000} rows={3} />
            </label>
          </div>
          <button type="submit">
            {busy ? 'Enregistrement…' : 'Demander la faisabilité'}
          </button>
        </fieldset>
      </form>
      {disabled && (
        <p>Enregistrez votre carte pour joindre sa version à la demande.</p>
      )}
      <p role="status">{message}</p>
      {requests.length > 0 && (
        <>
          <h3>Mes demandes</h3>
          <ul>
            {requests.map((request) => (
              <li key={request.id}>
                {request.quantity} exemplaires · {request.material} · Carte
                version {request.revision} —{' '}
                {stages[request.id]
                  ? printStageLabels[stages[request.id].stage]
                  : 'En attente d’étude'}
                {stages[request.id]?.note
                  ? ` · ${stages[request.id].note}`
                  : ''}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
