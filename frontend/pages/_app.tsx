import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ApolloProvider } from '@apollo/client';
import { ConfigProvider } from 'antd';
import NProgress from 'nprogress';
import Page from '../components/Page';
import { getApolloClient } from '../lib/apolloClient';
import theme from '../lib/theme';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [client] = useState(() => getApolloClient());
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleDone = () => NProgress.done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleDone);
    router.events.on('routeChangeError', handleDone);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleDone);
      router.events.off('routeChangeError', handleDone);
    };
  }, [router.events]);

  return (
    <ApolloProvider client={client}>
      <ConfigProvider theme={theme}>
        <Page>
          <Component {...pageProps} />
        </Page>
      </ConfigProvider>
    </ApolloProvider>
  );
}
