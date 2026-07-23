import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Form, Input, Button, Typography, Alert } from 'antd';
import ErrorMessage from './ErrorMessage';

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

interface FormValues {
  email: string;
}

const RequestReset = () => {
  const [success, setSuccess] = useState(false);
  const [requestReset, { error, loading }] = useMutation(REQUEST_RESET_MUTATION);
  const [form] = Form.useForm<FormValues>();

  const onFinish = async (values: FormValues) => {
    setSuccess(false);
    await requestReset({ variables: values });
    setSuccess(true);
    form.resetFields();
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading} data-test="form">
      <Typography.Title level={2}>Request a password reset</Typography.Title>
      <ErrorMessage error={error} />
      {success && !error && (
        <Alert type="success" message="Check your email for a reset link!" style={{ marginBottom: '1rem' }} />
      )}
      <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
        <Input type="email" placeholder="email" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Request Reset
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RequestReset;
export { REQUEST_RESET_MUTATION };
