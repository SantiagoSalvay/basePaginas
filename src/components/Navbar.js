import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiMenu, FiX, FiUser, FiShoppingCart } from "react-icons/fi";
import CurrencySelector from "./CurrencySelector";
import { useCurrency } from "../context/CurrencyContext";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const Navbar = () => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { t } = useCurrency();
  const { cartCount } = useCart();
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

  // Animaciones
  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  if (!mounted) return null;

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white dark:bg-gray-900 shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <h1
                className={`text-2xl font-display font-bold ${
                  scrolled || theme === "dark"
                    ? "text-primary-600 dark:text-white"
                    : "text-white"
                }`}
              >
                ModaVista
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <span
                className={`font-medium hover:text-primary-600 transition-colors ${
                  scrolled || theme === "dark"
                    ? "text-gray-800 dark:text-white"
                    : "text-white"
                }`}
              >
                {t('home')}
              </span>
            </Link>
            <Link href="/coleccion">
              <span
                className={`font-medium hover:text-primary-600 transition-colors ${
                  scrolled || theme === "dark"
                    ? "text-gray-800 dark:text-white"
                    : "text-white"
                }`}
              >
                {t('products')}
              </span>
            </Link>
            <Link href="/nosotros">
              <span
                className={`font-medium hover:text-primary-600 transition-colors ${
                  scrolled || theme === "dark"
                    ? "text-gray-800 dark:text-white"
                    : "text-white"
                }`}
              >
                {t('about')}
              </span>
            </Link>
            <Link href="/contacto">
              <span
                className={`font-medium hover:text-primary-600 transition-colors ${
                  scrolled || theme === "dark"
                    ? "text-gray-800 dark:text-white"
                    : "text-white"
                }`}
              >
                {t('contact')}
              </span>
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Currency Selector */}
            <CurrencySelector />
            
            {/* Shopping Cart */}
            <div 
              className="relative cursor-pointer"
              onClick={() => {
                if (session) {
                  router.push("/user/dashboard");
                  if (typeof window !== "undefined") {
                    localStorage.setItem("activeTab", "cart");
                  }
                } else {
                  toast.info(t('loginRequired'), {
                    position: "top-center",
                    autoClose: 3000,
                  });
                  signIn();
                }
              }}
            >
              <button
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  scrolled || theme === "dark"
                    ? "text-gray-800 dark:text-white"
                    : "text-white"
                }`}
                aria-label={t('cart')}
              >
                <FiShoppingCart size={20} />
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
              className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                scrolled || theme === "dark"
                  ? "text-gray-800 dark:text-white"
                  : "text-white"
              }`}
              aria-label={theme === "dark" ? t('lightMode') : t('darkMode')}
            >
              {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* User Account */}
            {session ? (
              <div className="relative group">
                <button
                  className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                    scrolled || theme === "dark"
                      ? "text-gray-800 dark:text-white"
                      : "text-white"
                  }`}
                  aria-label="User Account"
                >
                  <FiUser size={20} />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.user.email}
                    </p>
                  </div>
                  {session.user.role !== 'admin' && (
                    <Link href="/user/dashboard">
                      <div className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        {t('profile')}
                      </div>
                    </Link>
                  )}
                  {session.user.role === "admin" && (
                    <Link href="/admin/dashboard">
                      <div className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        {t('adminPanel')}
                      </div>
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('logout')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  scrolled || theme === "dark"
                    ? "text-gray-800 dark:text-white"
                    : "text-white"
                }`}
                aria-label={t('login')}
              >
                <FiUser size={20} />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                scrolled || theme === "dark"
                  ? "text-gray-800 dark:text-white"
                  : "text-white"
              }`}
              aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-white dark:bg-gray-900 z-40 md:hidden flex flex-col pt-16"
          >
            <div className="container mx-auto px-4 py-8 flex-1 overflow-y-auto">
              <nav className="flex flex-col space-y-6">
                <Link href="/">
                  <span
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xl font-medium text-gray-800 dark:text-white hover:text-primary-600 transition-colors"
                  >
                    {t('home')}
                  </span>
                </Link>
                <Link href="/coleccion">
                  <span
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xl font-medium text-gray-800 dark:text-white hover:text-primary-600 transition-colors"
                  >
                    {t('products')}
                  </span>
                </Link>
                <Link href="/nosotros">
                  <span
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xl font-medium text-gray-800 dark:text-white hover:text-primary-600 transition-colors"
                  >
                    {t('about')}
                  </span>
                </Link>
                <Link href="/contacto">
                  <span
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xl font-medium text-gray-800 dark:text-white hover:text-primary-600 transition-colors"
                  >
                    {t('contact')}
                  </span>
                </Link>
                
                <div 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (session) {
                      router.push("/user/dashboard");
                      if (typeof window !== "undefined") {
                        localStorage.setItem("activeTab", "cart");
                      }
                    } else {
                      toast.info(t('loginRequired'), {
                        position: "top-center",
                        autoClose: 3000,
                      });
                      signIn();
                    }
                  }}
                  className="text-xl font-medium text-gray-800 dark:text-white hover:text-primary-600 transition-colors flex items-center cursor-pointer"
                >
                  <FiShoppingCart className="mr-2" />
                  {t('cart')}
                  {cartCount > 0 && (
                    <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('currency')}</span>
                      <CurrencySelector />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('theme')}</span>
                      <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
                      >
                        {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
