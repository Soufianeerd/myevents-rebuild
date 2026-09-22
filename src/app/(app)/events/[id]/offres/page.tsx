import Link from 'next/link';
import { eventScope } from '@/server/experience/service';
import { paymentReady, reconcileCheckout } from '@/server/payments/stripe';
import { testOffers } from '@/core/commerce/catalog';
import { CheckoutButton } from './CheckoutButton';
import styles from '../workspace.module.css';
export default async function OffersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string; cancelled?: string }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  let message = '';
  if (search.session_id) {
    try {
      await reconcileCheckout(id, search.session_id);
      message = 'Paiement de test confirmé. Vos services sont activés.';
    } catch {
      message =
        'Paiement pas encore confirmé. Rechargez cette page après validation Stripe.';
    }
  }
  const { event, context, repository } = await eventScope(id);
  const orders = await repository.orders(id, context.tenantId);
  const products = await repository.entitlements(id, context.tenantId);
  const ready = paymentReady();
  return (
    <div className={styles.workspace}>
      <Link href={`/events/${id}`}>← {event.name}</Link>
      <h1>Vos services, à la carte</h1>
      <p>
        Un produit seul ou plusieurs réunis. Chaque achat est associé à cet
        événement.
      </p>
      <div className={styles.notice}>
        <strong>Environnement Stripe Test</strong>
        <p>
          Tarifs de démonstration, aucun prélèvement réel. Les tarifs de
          production ne sont pas encore ouverts.
        </p>
      </div>
      {message && (
        <p role="status" className={styles.notice}>
          {message}
        </p>
      )}
      {search.cancelled && (
        <p role="status">
          Paiement annulé. Aucun service supplémentaire n’a été activé.
        </p>
      )}
      {!ready && (
        <p role="status" className={styles.notice}>
          La connexion Stripe Test est en attente. Vous pouvez déjà préparer
          votre invitation dans le Studio.
        </p>
      )}
      <div className={styles.grid}>
        {testOffers
          .filter((o) => o.active)
          .map((offer) => (
            <article key={offer.id} className={styles.card}>
              <h2>{offer.name}</h2>
              <strong className={styles.price}>
                {(offer.amount / 100).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </strong>
              <p>
                {offer.products
                  .map(
                    (p) =>
                      ({
                        invitation: 'Invitation et RSVP',
                        audio: 'QR Audio',
                        photo_video: 'QR Photo / Vidéo',
                        thank_you: 'Éditeur de cartes',
                      })[p],
                  )
                  .join(' + ')}
              </p>
              {offer.products.every((p) => products.includes(p)) ? (
                <p className={styles.enabled}>Déjà activé</p>
              ) : (
                <CheckoutButton
                  eventId={id}
                  offerId={offer.id}
                  enabled={ready}
                />
              )}
            </article>
          ))}
      </div>
      <h2>Mes commandes</h2>
      {orders.length ? (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Offre</th>
                <th>Montant de test</th>
                <th>État</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.offer.name}</td>
                  <td>{(order.offer.amount / 100).toFixed(2)} €</td>
                  <td>
                    {
                      {
                        pending: 'En attente',
                        paid: 'Payée',
                        refunded: 'Remboursée',
                      }[order.status]
                    }
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Aucune commande pour cet événement.</p>
      )}
      <Link href={`/events/${id}/studio`} className={styles.link}>
        Ouvrir mon Studio →
      </Link>
    </div>
  );
}
