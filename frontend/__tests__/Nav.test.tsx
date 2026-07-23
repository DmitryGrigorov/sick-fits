import { render, screen } from '@testing-library/react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import Nav from '../components/Nav';
import { CURRENT_USER_QUERY } from '../lib/useCurrentUser';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const notSignedInMocks: MockedResponse[] = [
  { request: { query: CURRENT_USER_QUERY }, result: { data: { me: null } } },
];

const signedInMocks: MockedResponse[] = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [fakeCartItem(), fakeCartItem({ quantity: 2 })] } } },
  },
];

describe('<Nav />', () => {
  it('renders a minimal nav when signed out', async () => {
    render(
      <MockedProvider mocks={notSignedInMocks}>
        <Nav />
      </MockedProvider>
    );

    expect(await screen.findByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByText('My Cart')).not.toBeInTheDocument();
  });

  it('renders the full nav and cart count when signed in', async () => {
    render(
      <MockedProvider mocks={signedInMocks}>
        <Nav />
      </MockedProvider>
    );

    expect(await screen.findByText('My Cart')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    // 3 (default fakeCartItem quantity) + 2 quantity across the two fake cart items
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
