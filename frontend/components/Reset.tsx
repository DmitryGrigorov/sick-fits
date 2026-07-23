import { gql, useMutation } from '@apollo/client';
import { Form, Input, Button, Typography } from 'antd';
import { useRouter } from 'next/router';
import ErrorMessage from './ErrorMessage';
import { CURRENT_USER_QUERY } from '../lib/useCurrentUser';

const RESET_MUTATION = gql`
  mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
    resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
      id
      email
      name
    }
  }
`;

interface FormValues {
  password: string;
  confirmPassword: string;
}

const Reset = ({ resetToken }: { resetToken: string }) => {
  const router = useRouter();
  const [reset, { error, loading }] = useMutation(RESET_MUTATION, {
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  });

  const onFinish = async (values: FormValues) => {
    await reset({ variables: { resetToken, ...values } });
    router.push('/');
  };

  return (
    <Form layout="vertical" onFinish={onFinish} disabled={loading}>
      <Typography.Title level={2}>Reset your password</Typography.Title>
      <ErrorMessage error={error} />
      <Form.Item label="Password" name="password" rules={[{ required: true }]}>
        <Input.Password placeholder="password" />
      </Form.Item>
      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) return Promise.resolve();
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password placeholder="confirm password" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Reset Your Password!
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Reset;
