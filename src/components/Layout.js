import Head from 'next/head';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCurrency } from '../context/CurrencyContext';

const Layout = ({ children, title = 'ModaVista', description = '' }) => {
  const { t, language } = useCurrency();

  // Efecto para actualizar el atributo lang del HTML
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description || t('welcome')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
