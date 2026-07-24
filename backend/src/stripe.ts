import Stripe from 'stripe';

let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  const secret = process.env.STRIPE_SECRET;
  if (!secret) {
    throw new Error('Stripe checkout is not configured. Set STRIPE_SECRET to enable payments.');
  }
  stripe ??= new Stripe(secret);
  return stripe;
}
