import Link from 'next/link';
import { Card, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import formatMoney from '../lib/formatMoney';
import DeleteItem from './DeleteItem';
import AddToCart from './AddToCart';
import type { Item as ItemType } from '../lib/types';

const Item = ({ item }: { item: ItemType }) => (
  <Card
    data-test="item"
    hoverable
    cover={
      item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={item.title} style={{ height: 240, objectFit: 'cover' }} />
      ) : undefined
    }
    actions={[
      <Link key="edit" href={`/update?id=${item.id}`}>
        <EditOutlined /> Edit
      </Link>,
      <AddToCart key="add" id={item.id} />,
      <DeleteItem key="delete" id={item.id}>
        Delete
      </DeleteItem>,
    ]}
  >
    <Card.Meta
      title={<Link href={`/item?id=${item.id}`}>{item.title}</Link>}
      description={
        <Space direction="vertical">
          <strong style={{ fontSize: '1.4rem', color: '#393939' }}>{formatMoney(item.price)}</strong>
          <span>{item.description}</span>
        </Space>
      }
    />
  </Card>
);

export default Item;
