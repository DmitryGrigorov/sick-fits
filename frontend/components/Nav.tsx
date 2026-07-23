import Link from 'next/link';
import { Menu, Badge } from 'antd';
import type { MenuProps } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCurrentUser } from '../lib/useCurrentUser';
import { cartOpenVar } from '../lib/apolloClient';
import Signout from './Signout';

const Nav = () => {
  const { data } = useCurrentUser();
  const me = data?.me;
  const cartCount = me ? me.cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0) : 0;

  const items: MenuProps['items'] = me
    ? [
        { key: 'shop', label: <Link href="/items">Shop</Link> },
        { key: 'sell', label: <Link href="/sell">Sell</Link> },
        { key: 'orders', label: <Link href="/orders">Orders</Link> },
        { key: 'account', label: <Link href="/me">Account</Link> },
        { key: 'signout', label: <Signout /> },
        {
          key: 'cart',
          label: (
            <span
              onClick={() => cartOpenVar(!cartOpenVar())}
              role="button"
              tabIndex={0}
              data-test="cart-toggle"
            >
              <Badge count={cartCount} size="small" offset={[8, 4]}>
                <ShoppingCartOutlined style={{ fontSize: 18, marginRight: 6 }} />
                My Cart
              </Badge>
            </span>
          ),
        },
      ]
    : [
        { key: 'shop', label: <Link href="/items">Shop</Link> },
        { key: 'signin', label: <Link href="/signup">Sign In</Link> },
      ];

  return (
    <Menu
      mode="horizontal"
      items={items}
      selectable={false}
      data-test="nav"
      style={{ flex: 1, minWidth: 0, justifyContent: 'flex-end', borderBottom: 'none' }}
    />
  );
};

export default Nav;
