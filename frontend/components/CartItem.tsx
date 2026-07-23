import { Row, Col, Typography } from 'antd';
import formatMoney from '../lib/formatMoney';
import RemoveFromCart from './RemoveFromCart';
import type { CartItem as CartItemType } from '../lib/types';

const { Text } = Typography;

const CartItem = ({ cartItem }: { cartItem: CartItemType }) => {
  if (!cartItem.item) {
    return (
      <Row align="middle" style={{ borderBottom: '1px solid #E1E1E1', padding: '1rem 0' }}>
        <Col flex="auto">
          <Text>This item has been removed</Text>
        </Col>
        <Col flex="none">
          <RemoveFromCart id={cartItem.id} />
        </Col>
      </Row>
    );
  }

  return (
    <Row align="middle" gutter={12} style={{ borderBottom: '1px solid #E1E1E1', padding: '1rem 0' }}>
      <Col flex="none">
        {cartItem.item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img width={80} src={cartItem.item.image} alt={cartItem.item.title} />
        )}
      </Col>
      <Col flex="auto">
        <Text strong>{cartItem.item.title}</Text>
        <br />
        <Text type="secondary">
          {formatMoney(cartItem.item.price * cartItem.quantity)}
          {' – '}
          {cartItem.quantity} &times; {formatMoney(cartItem.item.price)} each
        </Text>
      </Col>
      <Col flex="none">
        <RemoveFromCart id={cartItem.id} />
      </Col>
    </Row>
  );
};

export default CartItem;
