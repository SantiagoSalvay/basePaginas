import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import { CurrencyProvider } from "../context/CurrencyContext";
import { FeaturedProductsProvider } from '../context/FeaturedProductsContext';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps: { session, ...pageProps }, router }) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // Refrescar cada 5 minutos
      refetchOnWindowFocus={true} // Refrescar cuando la ventana recupera el foco
    >
      <ThemeProvider attribute="class">
        <CurrencyProvider>
          <CartProvider>
            <FavoritesProvider>
              <FeaturedProductsProvider>
                <Component {...pageProps} />
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
              </FeaturedProductsProvider>
            </FavoritesProvider>
          </CartProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
