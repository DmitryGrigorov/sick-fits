import { gql, useMutation } from '@apollo/client';
import { Form, Input, Button, Typography } from 'antd';
import ErrorMessage from './ErrorMessage';
import { CURRENT_USER_QUERY } from '../lib/useCurrentUser';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION($email: String!, $name: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

interface FormValues {
  name: string;
  email: string;
  password: string;
}

const Signup = () => {
  const [signup, { error, loading }] = useMutation(SIGNUP_MUTATION, {
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  });
  const [form] = Form.useForm<FormValues>();

  const onFinish = async (values: FormValues) => {
    await signup({ variables: values });
    form.resetFields();
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading}>
      <Typography.Title level={2}>Sign Up for an Account</Typography.Title>
      <ErrorMessage error={error} />
      <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
        <Input type="email" placeholder="email" />
      </Form.Item>
      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input placeholder="name" />
      </Form.Item>
      <Form.Item label="Password" name="password" rules={[{ required: true, min: 8 }]}>
        <Input.Password placeholder="password" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Sign Up
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Signup;
