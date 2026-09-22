import { stripeClient, fulfillSession } from '@/server/payments/stripe';
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET,
    signature = request.headers.get('stripe-signature');
  if (!secret || !signature)
    return new Response('Webhook unavailable', { status: 400 });
  if (Number(request.headers.get('content-length') ?? 0) > 1000000)
    return new Response('Payload too large', { status: 413 });
  let event;
  try {
    const body = await request.text();
    if (body.length > 1000000)
      return new Response('Payload too large', { status: 413 });
    event = stripeClient().webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }
  if (event.livemode)
    return new Response('Test mode required', { status: 400 });
  if (
    [
      'checkout.session.completed',
      'checkout.session.async_payment_succeeded',
    ].includes(event.type)
  ) {
    try {
      const session = event.data.object as {
        id: string;
        payment_status?: string;
      };
      if (session.payment_status === 'paid') await fulfillSession(session.id);
    } catch {
      return new Response('Fulfillment pending', { status: 500 });
    }
  }
  return Response.json({ received: true });
}
