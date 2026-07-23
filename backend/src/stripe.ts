import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET as string);

export default stripe;
