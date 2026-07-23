import { gql, useMutation } from '@apollo/client';
import { Form, Input, Button, Typography } from 'antd';
import ErrorMessage from './ErrorMessage';
import { CURRENT_USER_QUERY } from '../lib/useCurrentUser';

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
    }
  }
`;

interface FormValues {
  email: string;
  password: string;
}

const Signin = () => {
  const [signin, { error, loading }] = useMutation(SIGNIN_MUTATION, {
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  });
  const [form] = Form.useForm<FormValues>();

  const onFinish = async (values: FormValues) => {
    await signin({ variables: values });
    form.resetFields();
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading}>
      <Typography.Title level={2}>Sign into your Account</Typography.Title>
      <ErrorMessage error={error} />
      <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
        <Input type="email" placeholder="email" />
      </Form.Item>
      <Form.Item label="Password" name="password" rules={[{ required: true }]}>
        <Input.Password placeholder="password" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Sign In
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Signin;
