import { Alert } from 'antd';
import type { ApolloError } from '@apollo/client';

interface DisplayErrorProps {
  error?: ApolloError | Error | null;
}

const DisplayError = ({ error }: DisplayErrorProps) => {
  if (!error || !error.message) return null;

  const graphQLErrors = (error as ApolloError).graphQLErrors;
  const messages =
    graphQLErrors && graphQLErrors.length
      ? graphQLErrors.map(e => e.message)
      : [error.message.replace('GraphQL error: ', '')];

  return (
    <>
      {messages.map((message, i) => (
        <Alert
          key={i}
          type="error"
          showIcon
          message="Shoot!"
          description={<span data-test="graphql-error">{message}</span>}
          style={{ margin: '1rem 0' }}
        />
      ))}
    </>
  );
};

export default DisplayError;
