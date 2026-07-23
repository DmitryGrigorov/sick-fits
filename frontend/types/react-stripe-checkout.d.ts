declare module 'react-stripe-checkout' {
  import type { ComponentType, ReactNode } from 'react';

  export interface StripeToken {
    id: string;
    email?: string;
  }

  export interface StripeCheckoutProps {
    token: (token: StripeToken) => void;
    stripeKey: string;
    amount?: number;
    name?: string;
    description?: string;
    image?: string;
    currency?: string;
    email?: string;
    children?: ReactNode;
  }

  const StripeCheckout: ComponentType<StripeCheckoutProps>;
  export default StripeCheckout;
}
