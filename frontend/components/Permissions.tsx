import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Checkbox, Button, Skeleton, message } from 'antd';
import ErrorMessage from './ErrorMessage';
import type { Permission } from '../lib/types';

const possiblePermissions: Permission[] = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation updatePermissions($permissions: [Permission!], $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      name
      email
      permissions
    }
  }
`;

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

interface PermissionUser {
  id: string;
  name: string;
  email: string;
  permissions: Permission[];
}

interface AllUsersData {
  users: PermissionUser[];
}

const UserPermissionsRow = ({ user }: { user: PermissionUser }) => {
  const [permissions, setPermissions] = useState<Permission[]>(user.permissions);
  const [updatePermissions, { loading, error }] = useMutation(UPDATE_PERMISSIONS_MUTATION, {
    variables: { permissions, userId: user.id },
  });

  const togglePermission = (permission: Permission, checked: boolean) => {
    setPermissions(prev => (checked ? [...prev, permission] : prev.filter(p => p !== permission)));
  };

  return (
    <>
      {error && (
        <tr>
          <td colSpan={possiblePermissions.length + 3}>
            <ErrorMessage error={error} />
          </td>
        </tr>
      )}
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(permission => (
          <td key={permission} style={{ textAlign: 'center' }}>
            <Checkbox
              checked={permissions.includes(permission)}
              onChange={e => togglePermission(permission, e.target.checked)}
            />
          </td>
        ))}
        <td>
          <Button
            type="primary"
            size="small"
            loading={loading}
            onClick={() => updatePermissions().catch(err => message.error(err.message))}
          >
            Update
          </Button>
        </td>
      </tr>
    </>
  );
};

const Permissions = () => {
  const { data, loading, error } = useQuery<AllUsersData>(ALL_USERS_QUERY);

  if (loading) return <Skeleton active />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            {possiblePermissions.map(permission => (
              <th key={permission}>{permission}</th>
            ))}
            <th>⬇️</th>
          </tr>
        </thead>
        <tbody>
          {data?.users.map(user => (
            <UserPermissionsRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Permissions;
