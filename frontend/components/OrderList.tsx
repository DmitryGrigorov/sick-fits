import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { formatDistance } from 'date-fns';
import { Skeleton, Card, Row, Col, Typography } from 'antd';
import ErrorMessage from './ErrorMessage';
import formatMoney from '../lib/formatMoney';
import type { Order } from '../lib/types';

const { Title } = Typography;

const USER_ORDERS_QUERY = gql`
  query USER_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      total
      createdAt
      items {
        id
        title
        price
        description
        quantity
        image
      }
    }
  }
`;

interface UserOrdersData {
  orders: Order[];
}

const OrderList = () => {
  const { data, loading, error } = useQuery<UserOrdersData>(USER_ORDERS_QUERY);

  if (loading) return <Skeleton active />;
  if (error) return <ErrorMessage error={error} />;

  const orders = data?.orders ?? [];

  return (
    <div>
      <Title level={2}>You have {orders.length} orders</Title>
      <Row gutter={[24, 24]}>
        {orders.map(order => (
          <Col key={order.id} xs={24} sm={12}>
            <Link href={`/order?id=${order.id}`}>
              <Card hoverable>
                <p>{order.items.reduce((a, b) => a + b.quantity, 0)} Items</p>
                <p>{order.items.length} Products</p>
                <p>{formatDistance(new Date(order.createdAt), new Date())} ago</p>
                <p>{formatMoney(order.total)}</p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {order.items.map(item => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={item.id} width={48} src={item.image} alt={item.title} />
                  ))}
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default OrderList;
