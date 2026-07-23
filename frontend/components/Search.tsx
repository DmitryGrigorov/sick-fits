import { useMemo } from 'react';
import { AutoComplete, Input } from 'antd';
import { gql, useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import debounce from 'lodash.debounce';

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: { OR: [{ title_contains: $searchTerm }, { description_contains: $searchTerm }] }
    ) {
      id
      image
      title
    }
  }
`;

interface SearchItem {
  id: string;
  image: string | null;
  title: string;
}

interface SearchItemsData {
  items: SearchItem[];
}

const Search = () => {
  const router = useRouter();
  const [searchItems, { data, loading }] = useLazyQuery<SearchItemsData>(SEARCH_ITEMS_QUERY);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        if (searchTerm.trim()) {
          searchItems({ variables: { searchTerm } });
        }
      }, 350),
    [searchItems]
  );

  const options = (data?.items ?? []).map(item => ({
    value: item.id,
    label: (
      <span>
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img width={40} src={item.image} alt={item.title} style={{ marginRight: 8, verticalAlign: 'middle' }} />
        )}
        {item.title}
      </span>
    ),
  }));

  return (
    <AutoComplete
      style={{ width: '100%' }}
      options={options}
      onSearch={debouncedSearch}
      onSelect={(id: string) => router.push(`/item?id=${id}`)}
      notFoundContent={loading ? 'Searching...' : 'Nothing found'}
    >
      <Input.Search id="search" placeholder="Search For An Item" allowClear />
    </AutoComplete>
  );
};

export default Search;
