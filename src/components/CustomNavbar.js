import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiMenu, FiX, FiUser, FiShoppingBag, FiHeart } from "react-icons/fi";
import CurrencySelector from "./CurrencySelector";
import { useCurrency } from "../context/CurrencyContext";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useFavorites } from '../context/FavoritesContext';

// Versión personalizada del Navbar sin opciones de navegación principal
const CustomNavbar = () => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { t } = useCurrency();
  const { cartCount, cartTotal, showCartNotification } = useCart();
  const { favoriteItems } = useFavorites();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detectar scroll para cambiar el estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white dark:bg-gray-900 shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      {/* Notificación de total del carrito */}
      <AnimatePresence>
        {showCartNotification && cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center">
              <FiShoppingBag className="mr-2" />
              <div>
                <p className="font-medium">Total: ${cartTotal.toFixed(2)}</p>
                <p className="text-xs">{cartCount} {cartCount === 1 ? 'producto' : 'productos'} en carrito</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <h1
                className={`text-lg sm:text-xl md:text-2xl font-display font-bold ${
                  scrolled || theme === "dark"
                    ? "text-primary-600 dark:text-white"
                    : "text-white"
                }`}
              >
                ModaVista
              </h1>
            </div>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {/* Currency Selector */}
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>
            
            {/* Shopping Cart */}
            <div 
              className="relative cursor-pointer"
              onClick={() => router.push("/cart")}
            >
              <button
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  scrolled || theme === "dark"
                    ? "text-gray-800 dark:text-white"
                    : "text-white"
                }`}
                aria-label={t('cart')}
              >
                <FiShoppingBag size={20} />
              </button>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === "dark" ? t('lightMode') : t('darkMode')}
            >
              {theme === "dark" ? (
                <FiSun 
                  size={20} 
                  className={`${
                    scrolled || theme === "dark"
                      ? "text-gray-800 dark:text-white"
                      : "text-white"
                  }`} 
                />
              ) : (
                <FiMoon 
                  size={20} 
                  className={`${
                    scrolled || theme === "dark"
                      ? "text-gray-800 dark:text-white"
                      : "text-white"
                  }`} 
                />
              )}
            </button>

            {/* User Account */}
            {session ? (
              <Link href="/profile">
                <button
                  className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                    scrolled || theme === "dark"
                      ? "text-gray-800 dark:text-white"
                      : "text-white"
                  }`}
                  aria-label="Profile"
                >
                  <FiUser size={20} />
                </button>
              </Link>
            ) : (
              <button
                onClick={() => signIn()}
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  scrolled || theme === "dark"
                    ? "text-gray-800 dark:text-white"
                    : "text-white"
                }`}
                aria-label="Sign in"
              >
                <FiUser size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomNavbar; 