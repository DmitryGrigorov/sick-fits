import Head from 'next/head';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { Pagination as AntPagination, Skeleton } from 'antd';
import { perPage } from '../config';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

interface PaginationData {
  itemsConnection: { aggregate: { count: number } };
}

const Pagination = ({ page }: { page: number }) => {
  const router = useRouter();
  const { data, loading } = useQuery<PaginationData>(PAGINATION_QUERY);

  if (loading) return <Skeleton active paragraph={false} />;

  const count = data?.itemsConnection.aggregate.count ?? 0;
  const pages = Math.max(1, Math.ceil(count / perPage));

  return (
    <div data-test="pagination" style={{ textAlign: 'center', margin: '2rem 0' }}>
      <Head>
        <title>
          Sick Fits! — Page {page} of {pages}
        </title>
      </Head>
      <AntPagination
        current={page}
        total={count}
        pageSize={perPage}
        showSizeChanger={false}
        onChange={newPage => router.push(`/items?page=${newPage}`)}
      />
      <p>{count} Items Total</p>
    </div>
  );
};

export default Pagination;
