import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { Form, Input, InputNumber, Button, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ErrorMessage from './ErrorMessage';

type CustomRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $image: String
    $largeImage: String
    $price: Int!
  ) {
    createItem(
      title: $title
      description: $description
      image: $image
      largeImage: $largeImage
      price: $price
    ) {
      id
    }
  }
`;

interface CreateItemData {
  createItem: { id: string };
}

interface FormValues {
  title: string;
  description: string;
  price: number;
}

const CreateItem = () => {
  const router = useRouter();
  const [image, setImage] = useState('');
  const [largeImage, setLargeImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [createItem, { loading, error }] = useMutation<CreateItemData>(CREATE_ITEM_MUTATION);

  const uploadFile = async (options: CustomRequestOptions) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    const data = new FormData();
    data.append('file', file as Blob);
    data.append('upload_preset', 'sick-fits');
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dt81vcbxa/image/upload', {
        method: 'POST',
        body: data,
      });
      const uploaded = await res.json();
      setImage(uploaded.secure_url);
      setLargeImage(uploaded.eager?.[0]?.secure_url ?? uploaded.secure_url);
      onSuccess?.(uploaded);
    } catch (err) {
      message.error('Image upload failed');
      onError?.(err as Error);
    } finally {
      setUploading(false);
    }
  };

  const onFinish = async (values: FormValues) => {
    const res = await createItem({
      variables: { ...values, image, largeImage },
    });
    if (res.data) {
      router.push(`/item?id=${res.data.createItem.id}`);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} disabled={loading} style={{ maxWidth: 500, margin: '0 auto' }}>
      <ErrorMessage error={error} />
      <Form.Item label="Image">
        <Upload customRequest={uploadFile} showUploadList={false} accept="image/*">
          <Button icon={<UploadOutlined />} loading={uploading}>
            Upload an image
          </Button>
        </Upload>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img width={200} src={image} alt="Upload Preview" style={{ marginTop: '1rem', display: 'block' }} />
        )}
      </Form.Item>
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
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateItem;
