import Stripe from 'stripe';
import { randomBytes, randomUUID } from 'node:crypto';
import { testOffers, type Order, type Offer } from '@/core/commerce/catalog';
import {
  appOrigin,
  eventScope,
  experienceRepository,
} from '@/server/experience/service';
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^(sk|rk)_test_/.test(key))
    throw new Error('Stripe Test doit être connecté avant le paiement.');
  return new Stripe(key);
}
export function paymentReady() {
  return (
    /^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY ?? '') &&
    (process.env.PAYMENT_FULFILLMENT_SECRET?.length ?? 0) >= 32
  );
}
export async function createCheckout(eventId: string, offerId: string) {
  if (!paymentReady())
    throw new Error('Le paiement de test n’est pas encore configuré.');
  const offer = testOffers.find((o) => o.id === offerId && o.active);
  if (!offer) throw new Error('Offre indisponible.');
  return checkoutOffer(eventId, offer);
}
export async function checkoutOffer(eventId: string, offer: Offer) {
  if (!paymentReady()) throw new Error('Stripe Test doit être configuré.');
  const stripe = stripeClient();
  const { event, context, repository } = await eventScope(eventId);
  const order: Order = {
    id: randomUUID(),
    eventId: event.id,
    tenantId: context.tenantId,
    offer,
    status: 'pending',
    sessionId: null,
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
  await repository.createOrder(order);
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      client_reference_id: order.id,
      metadata: { order_id: order.id, event_id: event.id },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: offer.amount,
            product_data: { name: `MyEvents — ${offer.name} (TEST)` },
          },
          quantity: 1,
        },
      ],
      success_url: `${appOrigin()}/events/${event.id}/offres?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin()}/events/${event.id}/offres?cancelled=1`,
      integration_identifier: `myevents_${randomBytes(8).toString('hex').slice(0, 8)}`,
    },
    { idempotencyKey: order.id },
  );
  if (session.livemode || !session.url)
    throw new Error('Une session Stripe Test est requise.');
  await repository.attachSession(order.id, context.tenantId, session.id);
  return session.url;
}
export async function fulfillSession(sessionId: string) {
  if (!/^cs_test_[A-Za-z0-9_]+$/.test(sessionId))
    throw new Error('Session de test invalide.');
  const session = await stripeClient().checkout.sessions.retrieve(sessionId);
  if (
    session.livemode ||
    session.payment_status !== 'paid' ||
    session.status !== 'complete' ||
    session.mode !== 'payment' ||
    session.currency !== 'eur' ||
    !session.metadata?.order_id ||
    session.amount_total === null
  )
    throw new Error('Paiement non confirmé.');
  const secret = process.env.PAYMENT_FULFILLMENT_SECRET;
  if (!secret || secret.length < 32)
    throw new Error('Activation des services indisponible.');
  await (
    await experienceRepository(false)
  ).fulfill(
    session.metadata.order_id,
    session.id,
    session.amount_total,
    new Date().toISOString(),
    secret,
  );
}
export async function reconcileCheckout(eventId: string, sessionId: string) {
  const { context, repository } = await eventScope(eventId);
  const order = (await repository.orders(eventId, context.tenantId)).find(
    (o) => o.sessionId === sessionId,
  );
  if (!order)
    throw new Error('Cette commande ne correspond pas à votre événement.');
  await fulfillSession(sessionId);
}
