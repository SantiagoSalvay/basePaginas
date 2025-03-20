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

const Navbar = () => {
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

  // Cerrar menú al navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

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

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/products' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Contacto', href: '/contacto' },
  ];

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm lg:text-base font-medium hover:text-primary-600 transition-colors ${
                  router.pathname === item.href
                    ? "text-primary-600 dark:text-primary-400"
                    : scrolled || theme === "dark"
                      ? "text-gray-800 dark:text-white"
                      : "text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button - Asegurarse de que sea visible en móviles */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? (
              <FiX 
                size={24} 
                className={`${
                  scrolled || theme === "dark"
                    ? "text-gray-800 dark:text-white"
                    : "text-white"
                }`} 
              />
            ) : (
              <FiMenu 
                size={24} 
                className={`${
                  scrolled || theme === "dark"
                    ? "text-gray-800 dark:text-white"
                    : "text-white"
                }`} 
              />
            )}
          </button>

          {/* Right Side Actions - Solo visible en desktop */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {/* Currency Selector */}
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>
            
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
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={closeMenu}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="fixed top-16 left-0 right-0 bg-white dark:bg-gray-900 z-50 md:hidden shadow-xl"
            >
              <div className="py-4 px-6">
                <nav className="flex flex-col space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMenu}
                      className={`text-base font-medium ${
                        router.pathname === item.href
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                      } transition-colors`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Carrito */}
                    <div 
                      onClick={() => {
                        closeMenu();
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
                      className="flex items-center py-3 text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                    >
                      <FiShoppingBag className="mr-3" size={20} />
                      <span className="font-medium">{t('cart')}</span>
                      {cartCount > 0 && (
                        <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </div>
                    
                    {/* Favoritos */}
                    <Link href="/favorites">
                      <div 
                        onClick={closeMenu}
                        className="flex items-center py-3 text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                      >
                        <FiHeart className="mr-3" size={20} />
                        <span className="font-medium">Favoritos</span>
                        {favoriteItems?.length > 0 && (
                          <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {favoriteItems.length}
                          </span>
                        )}
                      </div>
                    </Link>
                    
                    {/* Cuenta de usuario */}
                    {session ? (
                      <>
                        <div className="py-3 text-gray-800 dark:text-white">
                          <p className="font-medium">{session.user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{session.user.email}</p>
                        </div>
                        
                        {session.user.role === "admin" ? (
                          <Link href="/admin/dashboard">
                            <div 
                              onClick={closeMenu}
                              className="flex items-center py-3 text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                            >
                              <FiUser className="mr-3" size={20} />
                              <span className="font-medium">{t('adminPanel')}</span>
                            </div>
                          </Link>
                        ) : (
                          <Link href="/user/dashboard">
                            <div 
                              onClick={closeMenu}
                              className="flex items-center py-3 text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                            >
                              <FiUser className="mr-3" size={20} />
                              <span className="font-medium">{t('profile')}</span>
                            </div>
                          </Link>
                        )}
                        
                        <button
                          onClick={() => {
                            closeMenu();
                            signOut();
                          }}
                          className="flex items-center py-3 text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                        >
                          <span className="font-medium">{t('logout')}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          closeMenu();
                          signIn();
                        }}
                        className="flex items-center py-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer"
                      >
                        <FiUser className="mr-3" size={20} />
                        <span className="font-medium">{t('login')}</span>
                      </button>
                    )}
                    
                    {/* Selector de tema */}
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-800 dark:text-white font-medium">{t('theme')}</span>
                      <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
                      >
                        {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
                      </button>
                    </div>
                    
                    {/* Selector de moneda */}
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-800 dark:text-white font-medium">{t('currency')}</span>
                      <CurrencySelector />
                    </div>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
