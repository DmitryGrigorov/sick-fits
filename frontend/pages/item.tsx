import { useRouter } from 'next/router';
import SingleItem from '../components/SingleItem';

const ItemPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  if (!id) return null;
  return (
    <div>
      <SingleItem id={id} />
    </div>
  );
};

export default ItemPage;
