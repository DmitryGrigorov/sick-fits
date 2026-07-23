import { useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Form, Input, InputNumber, Button, Skeleton } from 'antd';
import ErrorMessage from './ErrorMessage';

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION($id: ID!, $title: String, $description: String, $price: Int) {
    updateItem(id: $id, title: $title, description: $description, price: $price) {
      id
      title
      description
      price
    }
  }
`;

interface SingleItemData {
  item: { id: string; title: string; description: string; price: number } | null;
}

interface FormValues {
  title: string;
  description: string;
  price: number;
}

const UpdateItem = ({ id }: { id: string }) => {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const { data, loading: queryLoading } = useQuery<SingleItemData>(SINGLE_ITEM_QUERY, {
    variables: { id },
  });
  const [updateItem, { loading, error }] = useMutation(UPDATE_ITEM_MUTATION);

  useEffect(() => {
    if (data?.item) {
      form.setFieldsValue({
        title: data.item.title,
        description: data.item.description,
        price: data.item.price,
      });
    }
  }, [data, form]);

  if (queryLoading) return <Skeleton active />;
  if (!data?.item) return <p>No Item Found for {id}</p>;

  const onFinish = async (values: FormValues) => {
    await updateItem({ variables: { id, ...values } });
    router.push(`/item?id=${id}`);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading} style={{ maxWidth: 500, margin: '0 auto' }}>
      <ErrorMessage error={error} />
      <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Title is required' }]}>
        <Input placeholder="Title" />
      </Form.Item>
      <Form.Item label="Price" name="price" rules={[{ required: true, message: 'Price is required' }]}>
        <InputNumber<number> style={{ width: '100%' }} min={0} placeholder="Price" />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: 'Description is required' }]}
      >
        <Input.TextArea placeholder="Enter a description" rows={4} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UpdateItem;
