import Document, { Html, Head, Main, NextScript, type DocumentContext } from 'next/document';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import type { ReactElement } from 'react';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const cache = createCache();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) =>
          (
            <StyleProvider cache={cache}>
              <App {...props} />
            </StyleProvider>
          ) as ReactElement,
      });

    const initialProps = await Document.getInitialProps(ctx);
    const antdStyle = extractStyle(cache, true);

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          <style dangerouslySetInnerHTML={{ __html: antdStyle }} />
        </>
      ),
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="shortcut icon" href="/favicon.png" />
          <link rel="stylesheet" type="text/css" href="/nprogress.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
