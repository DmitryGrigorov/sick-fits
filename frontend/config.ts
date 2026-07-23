// This is client side config only - don't put anything in here that shouldn't be public!
export const endpoint = process.env.NEXT_PUBLIC_ENDPOINT || 'http://localhost:4444';
export const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_KEY || '';
export const perPage = 4;
