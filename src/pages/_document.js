import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="ModaVista - Ropa de diseño exclusivo" />
        <meta property="og:title" content="ModaVista - Moda Exclusiva" />
        <meta property="og:description" content="Descubre nuestra colección exclusiva de ropa de diseño" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="theme-color" content="#0ea5e9" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
