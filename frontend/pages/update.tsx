import { useRouter } from 'next/router';
import UpdateItem from '../components/UpdateItem';
import PleaseSignIn from '../components/PleaseSignIn';

const UpdatePage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  return (
    <div>
      <PleaseSignIn>{id && <UpdateItem id={id} />}</PleaseSignIn>
    </div>
  );
};

export default UpdatePage;
