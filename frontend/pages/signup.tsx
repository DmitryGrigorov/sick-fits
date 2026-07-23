import { Row, Col } from 'antd';
import Signup from '../components/Signup';
import Signin from '../components/Signin';
import RequestReset from '../components/RequestReset';

const SignUpPage = () => (
  <Row gutter={[24, 24]}>
    <Col xs={24} md={8}>
      <Signup />
    </Col>
    <Col xs={24} md={8}>
      <Signin />
    </Col>
    <Col xs={24} md={8}>
      <RequestReset />
    </Col>
  </Row>
);

export default SignUpPage;
