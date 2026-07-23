import { ApolloClient, InMemoryCache, HttpLink, makeVar } from '@apollo/client';
import { endpoint } from '../config';

// Reactive variable that drives the cart drawer's open/closed state.
// Replaces the old apollo-boost `@client` local-state pattern.
export const cartOpenVar = makeVar(false);

let browserClient: ApolloClient<unknown> | undefined;

function createApolloClient(): ApolloClient<unknown> {
  return new ApolloClient({
    link: new HttpLink({
      uri: endpoint,
      credentials: 'include',
    }),
    cache: new InMemoryCache(),
  });
}

export function getApolloClient(): ApolloClient<unknown> {
  // Always create a fresh client on the server so requests never share state.
  if (typeof window === 'undefined') {
    return createApolloClient();
  }
  if (!browserClient) {
    browserClient = createApolloClient();
  }
  return browserClient;
}
