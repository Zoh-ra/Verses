import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="fr">
        <Head>
          {/* Balises PWA essentielles */}
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="theme-color" content="#781ECF" />
          
          {/* Autres méta-balises PWA */}
          <meta name="application-name" content="Verses - Quran App" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Verses" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#781ECF" />
          <meta name="msapplication-tap-highlight" content="no" />
          
          {/* Script d'enregistrement du service worker */}
          <script src="/register-sw.js" defer></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
