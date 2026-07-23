import { Layout } from 'antd';
import type { ReactNode } from 'react';
import Header from './Header';
import Meta from './Meta';

const { Content } = Layout;

const Page = ({ children }: { children: ReactNode }) => (
  <Layout style={{ minHeight: '100vh', background: '#fff' }}>
    <Meta />
    <Header />
    <Content style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem', width: '100%' }}>
      {children}
    </Content>
  </Layout>
);

export default Page;
