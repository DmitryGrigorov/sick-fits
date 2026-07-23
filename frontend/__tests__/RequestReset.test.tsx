import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import RequestReset, { REQUEST_RESET_MUTATION } from '../components/RequestReset';

const email = 'test@example.com';

const mocks: MockedResponse[] = [
  {
    request: { query: REQUEST_RESET_MUTATION, variables: { email } },
    result: { data: { requestReset: { message: 'success', __typename: 'SuccessMessage' } } },
  },
];

describe('<RequestReset />', () => {
  it('renders the request reset form', () => {
    render(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );
    expect(screen.getByText('Request a password reset')).toBeInTheDocument();
  });

  it('submits the email and shows a success message', async () => {
    const user = userEvent.setup();
    render(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );

    await user.type(screen.getByPlaceholderText('email'), email);
    await user.click(screen.getByRole('button', { name: 'Request Reset' }));

    expect(await screen.findByText('Check your email for a reset link!')).toBeInTheDocument();
  });
});
