import Head from 'next/head';
import { gql, useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { Skeleton, Row, Col, Typography, Descriptions } from 'antd';
import formatMoney from '../lib/formatMoney';
import ErrorMessage from './ErrorMessage';
import type { Order as OrderType } from '../lib/types';

const { Title, Text } = Typography;

const SINGLE_ORDER_QUERY = gql`
  query SINGLE_ORDER_QUERY($id: ID!) {
    order(id: $id) {
      id
      charge
      total
      createdAt
      user {
        id
      }
      items {
        id
        title
        description
        price
        image
        quantity
      }
    }
  }
`;

interface SingleOrderData {
  order: OrderType | null;
}

const Order = ({ id }: { id: string }) => {
  const { data, error, loading } = useQuery<SingleOrderData>(SINGLE_ORDER_QUERY, {
    variables: { id },
  });

  if (error) return <ErrorMessage error={error} />;
  if (loading) return <Skeleton active />;
  if (!data?.order) return <p>No order found</p>;

  const { order } = data;

  return (
    <div data-test="order">
      <Head>
        <title>Sick Fits - Order {order.id}</title>
      </Head>
      <Title level={2}>Order Details</Title>
      <Descriptions bordered column={1} style={{ marginBottom: '2rem' }}>
        <Descriptions.Item label="Order ID">{order.id}</Descriptions.Item>
        <Descriptions.Item label="Charge">{order.charge}</Descriptions.Item>
        <Descriptions.Item label="Date">{format(new Date(order.createdAt), 'MMMM d, yyyy h:mm a')}</Descriptions.Item>
        <Descriptions.Item label="Order Total">{formatMoney(order.total)}</Descriptions.Item>
        <Descriptions.Item label="Item Count">{order.items.length}</Descriptions.Item>
      </Descriptions>
      {order.items.map(item => (
        <Row key={item.id} gutter={16} align="middle" style={{ marginBottom: '1.5rem' }}>
          <Col flex="120px">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.title} style={{ width: '100%' }} />
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ margin: 0 }}>
              {item.title}
            </Title>
            <Text>Qty: {item.quantity}</Text>
            <br />
            <Text>Each: {formatMoney(item.price)}</Text>
            <br />
            <Text>SubTotal: {formatMoney(item.price * item.quantity)}</Text>
            <p>{item.description}</p>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default Order;
