import { gql, useQuery } from '@apollo/client';
import { Row, Col, Skeleton, Alert } from 'antd';
import Item from './Item';
import Pagination from './Pagination';
import { perPage } from '../config';
import type { Item as ItemType } from '../lib/types';

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;

interface AllItemsData {
  items: ItemType[];
}

const Items = ({ page }: { page: number }) => {
  const { data, error, loading } = useQuery<AllItemsData>(ALL_ITEMS_QUERY, {
    variables: {
      skip: page * perPage - perPage,
      first: perPage,
    },
  });

  return (
    <div style={{ textAlign: 'center' }}>
      <Pagination page={page} />
      {loading && <Skeleton active />}
      {error && <Alert type="error" message={error.message} />}
      {data && (
        <Row gutter={[24, 24]}>
          {data.items.map(item => (
            <Col key={item.id} xs={24} sm={12}>
              <Item item={item} />
            </Col>
          ))}
        </Row>
      )}
      <Pagination page={page} />
    </div>
  );
};

export default Items;
