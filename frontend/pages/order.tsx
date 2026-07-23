import { useRouter } from 'next/router';
import PleaseSignIn from '../components/PleaseSignIn';
import Order from '../components/Order';

const OrderPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  return (
    <div>
      <PleaseSignIn>{id && <Order id={id} />}</PleaseSignIn>
    </div>
  );
};

export default OrderPage;
