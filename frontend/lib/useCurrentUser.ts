import { gql, useQuery, type QueryResult } from '@apollo/client';
import type { User } from './types';

const CURRENT_USER_QUERY = gql`
  query CURRENT_USER_QUERY {
    me {
      id
      email
      name
      permissions
      cart {
        id
        quantity
        item {
          id
          price
          image
          title
          description
        }
      }
    }
  }
`;

interface CurrentUserData {
  me: User | null;
}

export function useCurrentUser(): QueryResult<CurrentUserData> {
  return useQuery<CurrentUserData>(CURRENT_USER_QUERY);
}

export { CURRENT_USER_QUERY };
