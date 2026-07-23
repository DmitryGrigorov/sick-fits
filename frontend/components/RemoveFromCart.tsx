import { gql, useMutation } from '@apollo/client';
import { Button, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { CURRENT_USER_QUERY } from '../lib/useCurrentUser';

const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const RemoveFromCart = ({ id }: { id: string }) => {
  const [removeFromCart, { loading }] = useMutation(REMOVE_FROM_CART_MUTATION, {
    variables: { id },
    optimisticResponse: {
      __typename: 'Mutation',
      removeFromCart: {
        __typename: 'CartItem',
        id,
      },
    },
    update(cache) {
      const normalizedId = cache.identify({ id, __typename: 'CartItem' });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });

  return (
    <Button
      type="text"
      danger
      title="Remove from cart"
      disabled={loading}
      icon={<CloseOutlined />}
      onClick={() => {
        removeFromCart().catch(err => message.error(err.message));
      }}
    />
  );
};

export default RemoveFromCart;
