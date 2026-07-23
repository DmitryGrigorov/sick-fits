import Link from 'next/link';
import { Layout, Row, Col } from 'antd';
import Nav from './Nav';
import Search from './Search';
import Cart from './Cart';

const { Header: AntHeader } = Layout;

const Header = () => (
  <AntHeader style={{ background: '#fff', borderBottom: '4px solid #393939', height: 'auto', padding: '1rem 2rem' }}>
    <Row align="middle" gutter={16} wrap>
      <Col flex="none">
        <Link href="/">
          <span
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: '#FF0000',
              color: '#fff',
              textTransform: 'uppercase',
              fontSize: '2rem',
              fontWeight: 'bold',
            }}
          >
            Sick Fits
          </span>
        </Link>
      </Col>
      <Col flex="auto">
        <Nav />
      </Col>
    </Row>
    <Row style={{ marginTop: '1rem' }}>
      <Col span={24}>
        <Search />
      </Col>
    </Row>
    <Cart />
  </AntHeader>
);

export default Header;
