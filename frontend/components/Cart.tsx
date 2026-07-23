import { Drawer, Button, Empty, Typography } from 'antd';
import { useReactiveVar } from '@apollo/client';
import { cartOpenVar } from '../lib/apolloClient';
import { useCurrentUser } from '../lib/useCurrentUser';
import CartItem from './CartItem';
import TakeMyMoney from './TakeMyMoney';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';

const { Text } = Typography;

const Cart = () => {
  const cartOpen = useReactiveVar(cartOpenVar);
  const { data } = useCurrentUser();
  const me = data?.me;

  if (!me) return null;

  return (
    <Drawer
      title={`${me.name}'s Cart`}
      open={cartOpen}
      onClose={() => cartOpenVar(false)}
      data-test="cart"
    >
      <p>
        You have {me.cart.length} item{me.cart.length === 1 ? '' : 's'} in your cart.
      </p>
      {me.cart.length === 0 && <Empty description="Your cart is empty" />}
      {me.cart.map(cartItem => (
        <CartItem key={cartItem.id} cartItem={cartItem} />
      ))}
      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <Text style={{ fontSize: '1.8rem', fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}>
          {formatMoney(calcTotalPrice(me.cart))}
        </Text>
        {me.cart.length > 0 && (
          <TakeMyMoney>
            <Button type="primary" block size="large">
              Checkout
            </Button>
          </TakeMyMoney>
        )}
      </div>
    </Drawer>
  );
};

export default Cart;
