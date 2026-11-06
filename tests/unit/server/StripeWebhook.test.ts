import Stripe from 'stripe';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const fulfillSession = vi.fn();
vi.mock('@/server/payments/stripe', async () => {
  const Stripe = (await import('stripe')).default;
  return {
    stripeClient: () => new Stripe('sk_test_unit'),
    fulfillSession: (id: string) => fulfillSession(id),
  };
});

const secret = 'whsec_unit_test_secret';
const signed = (payload: object) => {
  const body = JSON.stringify(payload);
  const header = new Stripe('sk_test_unit').webhooks.generateTestHeaderString({
    payload: body,
    secret,
  });
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': header },
    body,
  });
};
const completed = (livemode = false, payment_status = 'paid') => ({
  id: 'evt_test',
  object: 'event',
  type: 'checkout.session.completed',
  livemode,
  data: { object: { id: 'cs_test_abc', payment_status } },
});

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = secret;
  fulfillSession.mockReset();
});
afterEach(() => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
});

it('fulfils a signed, paid test-mode checkout session', async () => {
  const { POST } = await import('@/app/api/stripe/webhook/route');
  const response = await POST(signed(completed()));
  expect(response.status).toBe(200);
  expect(fulfillSession).toHaveBeenCalledWith('cs_test_abc');
});

it('rejects unsigned, tampered or live-mode events without fulfilment', async () => {
  const { POST } = await import('@/app/api/stripe/webhook/route');
  const tampered = signed(completed());
  const forged = new Request(tampered.url, {
    method: 'POST',
    headers: tampered.headers,
    body: JSON.stringify({ ...completed(), id: 'evt_other' }),
  });
  expect((await POST(forged)).status).toBe(400);
  expect(
    (
      await POST(
        new Request('http://localhost/api/stripe/webhook', {
          method: 'POST',
          body: '{}',
        }),
      )
    ).status,
  ).toBe(400);
  expect((await POST(signed(completed(true)))).status).toBe(400);
  expect((await POST(signed(completed(false, 'unpaid')))).status).toBe(200);
  expect(fulfillSession).not.toHaveBeenCalled();
});

it('asks Stripe to retry when fulfilment fails', async () => {
  fulfillSession.mockRejectedValueOnce(new Error('db down'));
  const { POST } = await import('@/app/api/stripe/webhook/route');
  expect((await POST(signed(completed()))).status).toBe(500);
});
