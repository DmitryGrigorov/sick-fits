import type { ReactNode } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Popconfirm, Button, message } from 'antd';

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

const DeleteItem = ({ id, children }: { id: string; children: ReactNode }) => {
  const [deleteItem, { loading }] = useMutation(DELETE_ITEM_MUTATION, {
    variables: { id },
    update(cache, { data }) {
      if (!data) return;
      const normalizedId = cache.identify({ id, __typename: 'Item' });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });

  return (
    <Popconfirm
      title="Are you sure you want to delete this item?"
      onConfirm={() => deleteItem().catch(err => message.error(err.message))}
      okText="Delete"
      okType="danger"
    >
      <Button danger loading={loading} type="link">
        {children}
      </Button>
    </Popconfirm>
  );
};

export default DeleteItem;
