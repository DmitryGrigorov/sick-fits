import { useRouter } from 'next/router';
import Items from '../components/Items';

const Home = () => {
  const router = useRouter();
  const page = parseFloat(router.query.page as string) || 1;
  return (
    <div>
      <Items page={page} />
    </div>
  );
};

export default Home;
