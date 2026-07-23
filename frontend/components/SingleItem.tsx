import Head from 'next/head';
import { gql, useQuery } from '@apollo/client';
import { Skeleton, Row, Col, Typography } from 'antd';
import ErrorMessage from './ErrorMessage';

const { Title, Paragraph } = Typography;

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      largeImage
    }
  }
`;

interface SingleItemData {
  item: {
    id: string;
    title: string;
    description: string;
    largeImage: string | null;
  } | null;
}

const SingleItem = ({ id }: { id: string }) => {
  const { data, loading, error } = useQuery<SingleItemData>(SINGLE_ITEM_QUERY, {
    variables: { id },
  });

  if (loading) return <Skeleton active />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.item) return <p>No Item Found for {id}</p>;

  const { item } = data;

  return (
    <Row gutter={32} align="middle" style={{ margin: '2rem 0' }}>
      <Head>
        <title>Sick Fits | {item.title}</title>
      </Head>
      <Col xs={24} md={12}>
        {item.largeImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.largeImage} alt={item.title} style={{ width: '100%' }} />
        )}
      </Col>
      <Col xs={24} md={12}>
        <Title level={2}>Viewing: {item.title}</Title>
        <Paragraph>{item.description}</Paragraph>
      </Col>
    </Row>
  );
};

export default SingleItem;
