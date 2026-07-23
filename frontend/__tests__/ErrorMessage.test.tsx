import { render, screen } from '@testing-library/react';
import ErrorMessage from '../components/ErrorMessage';

describe('<ErrorMessage />', () => {
  it('renders nothing when there is no error', () => {
    const { container } = render(<ErrorMessage error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the error message', () => {
    render(<ErrorMessage error={new Error('GraphQL error: Invalid Password!')} />);
    expect(screen.getByText('Invalid Password!')).toBeInTheDocument();
  });
});
