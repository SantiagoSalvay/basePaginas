import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import { CurrencyProvider } from "../context/CurrencyContext";
import { FeaturedProductsProvider } from '../context/FeaturedProductsContext';
import { CartProvider } from '../context/CartContext';
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
            <FeaturedProductsProvider>
              <AnimatePresence mode="wait" initial={false}>
                <Component {...pageProps} key={router.route} />
              </AnimatePresence>
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
          </CartProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
