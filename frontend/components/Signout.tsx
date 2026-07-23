import { gql, useMutation } from '@apollo/client';
import { Button } from 'antd';
import { CURRENT_USER_QUERY } from '../lib/useCurrentUser';

const SIGN_OUT_MUTATION = gql`
  mutation SIGN_OUT_MUTATION {
    signout {
      message
    }
  }
`;

const Signout = () => {
  const [signout] = useMutation(SIGN_OUT_MUTATION, {
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  });

  return (
    <Button type="text" onClick={() => signout()}>
      Sign Out
    </Button>
  );
};

export default Signout;
