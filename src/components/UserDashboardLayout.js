import Head from 'next/head';
import { useEffect } from 'react';
import DashboardNavbar from './DashboardNavbar';
import { useCurrency } from '../context/CurrencyContext';

const UserDashboardLayout = ({ children, title = 'Mi Perfil | ModaVista', description = '' }) => {
  const { t, language } = useCurrency();

  // Efecto para actualizar el atributo lang del HTML
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description || 'Gestiona tu perfil y compras en ModaVista'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <DashboardNavbar />
        <main className="flex-grow">{children}</main>
      </div>
    </>
  );
};

export default UserDashboardLayout; 