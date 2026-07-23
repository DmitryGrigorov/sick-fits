import { Descriptions, Tag, Typography } from 'antd';
import { useCurrentUser } from '../lib/useCurrentUser';

const MeComponent = () => {
  const { data } = useCurrentUser();
  const me = data?.me;

  if (!me) return null;

  return (
    <div>
      <Typography.Title level={2}>Your Account</Typography.Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Name">{me.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{me.email}</Descriptions.Item>
        <Descriptions.Item label="Permissions">
          {me.permissions.map(permission => (
            <Tag key={permission}>{permission}</Tag>
          ))}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default MeComponent;
