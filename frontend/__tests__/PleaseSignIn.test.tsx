import { render, screen } from '@testing-library/react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import PleaseSignIn from '../components/PleaseSignIn';
import { CURRENT_USER_QUERY } from '../lib/useCurrentUser';
import { fakeUser } from '../lib/testUtils';

const notSignedInMocks: MockedResponse[] = [
  { request: { query: CURRENT_USER_QUERY }, result: { data: { me: null } } },
];

const signedInMocks: MockedResponse[] = [
  { request: { query: CURRENT_USER_QUERY }, result: { data: { me: fakeUser() } } },
];

describe('<PleaseSignIn>', () => {
  it('renders the sign in dialog to logged out users', async () => {
    render(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignIn>
          <p>Secret content</p>
        </PleaseSignIn>
      </MockedProvider>
    );

    expect(await screen.findByText('Please Sign In before Continuing')).toBeInTheDocument();
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
  });

  it('renders the child component when the user is signed in', async () => {
    render(
      <MockedProvider mocks={signedInMocks}>
        <PleaseSignIn>
          <p>Secret content</p>
        </PleaseSignIn>
      </MockedProvider>
    );

    expect(await screen.findByText('Secret content')).toBeInTheDocument();
  });
});
