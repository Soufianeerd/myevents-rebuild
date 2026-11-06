import { notFound } from 'next/navigation';
import { formatEuros } from '@/core/commerce/catalog';
import { printStageLabels } from '@/core/admin/models';
import { currentOperator, operatorOverview } from '@/server/admin/service';
import { StageForm } from './StageForm';
import styles from '../events/[id]/workspace.module.css';
export const metadata = {
  title: 'Back-office — MyEvents',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';
const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Europe/Paris',
      })
    : '—';
const orderStatus = {
  pending: 'En attente',
  paid: 'Payée',
  refunded: 'Remboursée',
} as const;
export default async function AdminPage() {
  // Non-operators get a 404 so the back-office is not advertised.
  if (!(await currentOperator())) notFound();
  const data = await operatorOverview();
  return (
    <div className={styles.workspace}>
      <h1>Back-office</h1>
      <section aria-labelledby="totaux">
        <h2 id="totaux">Vue d’ensemble</h2>
        <dl className={styles.grid}>
          {[
            ['Comptes', data.totals.accounts],
            ['Événements', data.totals.events],
            ['Commandes payées', data.totals.paidOrders],
            ['Encaissé (test)', formatEuros(data.totals.revenueCents)],
          ].map(([label, value]) => (
            <div key={String(label)} className={styles.card}>
              <dt>{label}</dt>
              <dd className={styles.price}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section aria-labelledby="impressions">
        <h2 id="impressions">Demandes d’impression</h2>
        {data.requests.length ? (
          data.requests.map((r) => (
            <article key={r.id} className={styles.card}>
              <h3>
                {r.eventName} · {r.quantity} × {r.material}
                {r.finish ? ` (${r.finish})` : ''}
              </h3>
              <p>
                Reçue le {date(r.createdAt)} · Étape :{' '}
                <strong>{printStageLabels[r.stage]}</strong>
                {r.stageNote ? ` — ${r.stageNote}` : ''}
              </p>
              {r.notes ? <p>Notes du client : {r.notes}</p> : null}
              <StageForm requestId={r.id} current={r.stage} />
            </article>
          ))
        ) : (
          <p>Aucune demande d’impression.</p>
        )}
      </section>
      <section aria-labelledby="commandes">
        <h2 id="commandes">Commandes</h2>
        {data.orders.length ? (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Événement</th>
                  <th>Offre</th>
                  <th>Montant</th>
                  <th>État</th>
                  <th>Créée</th>
                  <th>Payée</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.eventName}</td>
                    <td>{o.offerName}</td>
                    <td>{formatEuros(o.amount)}</td>
                    <td>{orderStatus[o.status]}</td>
                    <td>{date(o.createdAt)}</td>
                    <td>{date(o.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Aucune commande.</p>
        )}
      </section>
    </div>
  );
}
