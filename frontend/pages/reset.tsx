import { useRouter } from 'next/router';
import { Typography } from 'antd';
import Reset from '../components/Reset';

const ResetPage = () => {
  const router = useRouter();
  const resetToken = router.query.resetToken as string;
  return (
    <div>
      <Typography.Paragraph>Reset your password {resetToken}</Typography.Paragraph>
      {resetToken && <Reset resetToken={resetToken} />}
    </div>
  );
};

export default ResetPage;
