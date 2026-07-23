import type { ReactNode } from 'react';
import StripeCheckout, { type StripeToken } from 'react-stripe-checkout';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { message } from 'antd';
import { stripePublicKey } from '../config';
import calcTotalPrice from '../lib/calcTotalPrice';
import { useCurrentUser, CURRENT_USER_QUERY } from '../lib/useCurrentUser';

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

interface CreateOrderData {
  createOrder: { id: string };
}

function totalItems(cart: { quantity: number }[]): number {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

const TakeMyMoney = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data, loading: userLoading } = useCurrentUser();
  const [createOrder] = useMutation<CreateOrderData>(CREATE_ORDER_MUTATION, {
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  });

  const me = data?.me;
  if (userLoading || !me) return null;

  const onToken = async (token: StripeToken) => {
    NProgress.start();
    try {
      const res = await createOrder({ variables: { token: token.id } });
      NProgress.done();
      if (res.data) {
        router.push(`/order?id=${res.data.createOrder.id}`);
      }
    } catch (err) {
      NProgress.done();
      message.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <StripeCheckout
      amount={calcTotalPrice(me.cart)}
      name="Sick Fits"
      description={`Order of ${totalItems(me.cart)} items!`}
      image={(me.cart[0]?.item?.image as string) || undefined}
      stripeKey={stripePublicKey}
      currency="USD"
      email={me.email}
      token={onToken}
    >
      {children}
    </StripeCheckout>
  );
};

export default TakeMyMoney;
