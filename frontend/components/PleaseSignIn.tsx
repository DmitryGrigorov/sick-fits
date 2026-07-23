import type { ReactNode } from 'react';
import { Skeleton } from 'antd';
import { useCurrentUser } from '../lib/useCurrentUser';
import Signin from './Signin';

const PleaseSignIn = ({ children }: { children: ReactNode }) => {
  const { data, loading } = useCurrentUser();

  if (loading) return <Skeleton active />;

  if (!data?.me) {
    return (
      <div>
        <p>Please Sign In before Continuing</p>
        <Signin />
      </div>
    );
  }

  return <>{children}</>;
};

export default PleaseSignIn;
