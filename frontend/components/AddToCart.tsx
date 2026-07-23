import { gql, useMutation } from '@apollo/client';
import { Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { CURRENT_USER_QUERY } from '../lib/useCurrentUser';

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
  });

  return (
    <Button icon={<ShoppingCartOutlined />} loading={loading} onClick={() => addToCart()}>
      Add To Cart
    </Button>
  );
};

export default AddToCart;
