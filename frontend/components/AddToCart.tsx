import { gql, useMutation } from '@apollo/client';
import { Button, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { CURRENT_USER_QUERY } from '../lib/useCurrentUser';
import { cartOpenVar } from '../lib/apolloClient';

const ADD_TO_CART_MUTATION = gql`
  mutation addToCart($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`;

const AddToCart = ({ id }: { id: string }) => {
  const [addToCart, { loading }] = useMutation(ADD_TO_CART_MUTATION, {
    variables: { id },
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
    awaitRefetchQueries: true,
  });

  return (
    <Button
      icon={<ShoppingCartOutlined />}
      loading={loading}
      onClick={async () => {
        try {
          await addToCart();
          cartOpenVar(true);
        } catch (error) {
          const text = error instanceof Error ? error.message : 'Could not add the item to your cart';
          const sessionExpired = /signed in|logged in|unauthenticated/i.test(text);
          message.error(sessionExpired ? 'Your session expired. Please sign in again.' : text);
        }
      }}
    >
      Add To Cart
    </Button>
  );
};

export default AddToCart;
