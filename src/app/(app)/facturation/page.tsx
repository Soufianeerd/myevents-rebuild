import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAccessContext } from '@/server/auth/getCurrentAccessContext';
import { createEventContainer } from '@/server/container/events';
import { experienceRepository } from '@/server/experience/service';
import styles from '../events/[id]/workspace.module.css';
export const metadata = {
  title: 'Mes achats — MyEvents',
  robots: { index: false, follow: false },
};
export default async function BillingPage() {
  const context = await getCurrentAccessContext();
  if (context.kind !== 'user') redirect('/connexion');
  const container = await createEventContainer();
  const workspaces = await container.workspaceRepository.findByTenantId(
    context.tenantId,
  );
  const events = (
    await Promise.all(
      workspaces.map((workspace) =>
        container.eventRepository.findByWorkspaceId(
          workspace.id,
          context.tenantId,
        ),
      ),
    )
  ).flat();
  const repository = await experienceRepository();
  const orders = (
    await Promise.all(
      events.map(async (event) =>
        (await repository.orders(event.id, context.tenantId)).map((order) => ({
          ...order,
          eventName: event.name,
        })),
      ),
    )
  )
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className={styles.workspace}>
      <Link href="/profil">← Mon profil</Link>
      <h1>Mes achats</h1>
      <p>Vos produits et commandes, réunis pour tous vos événements.</p>
      {!orders.length ? (
        <section className={styles.notice}>
          <p>Aucun achat pour le moment.</p>
          <Link href="/dashboard">Choisir les services d’un événement</Link>
        </section>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Événement</th>
                <th>Produit</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/events/${order.eventId}/offres`}>
                      {order.eventName}
                    </Link>
                  </td>
                  <td>
                    {order.offer.name}
                    {order.offer.testOnly && (
                      <p>Mode test — aucun débit réel</p>
                    )}
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    {(order.offer.amount / 100).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </td>
                  <td>
                    {
                      {
                        pending: 'En attente',
                        paid: 'Payé',
                        refunded: 'Remboursé',
                      }[order.status]
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
