import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiMenu, FiX, FiUser } from "react-icons/fi";

const Navbar = () => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                Inicio
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
                Colección
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
                Nosotros
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
                Contacto
              </span>
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                scrolled || theme === "dark"
                  ? "text-gray-800 dark:text-white"
                  : "text-white"
              }`}
              aria-label="Toggle Theme"
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
                        Mi Perfil
                      </div>
                    </Link>
                  )}
                  {session.user.role === "admin" && (
                    <Link href="/admin/dashboard">
                      <div className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        Panel de Administración
                      </div>
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cerrar Sesión
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
                aria-label="Sign In"
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
              aria-label="Toggle Mobile Menu"
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
            className="md:hidden fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold text-primary-600 dark:text-white">
                  ModaVista
                </h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                  aria-label="Close Menu"
                >
                  <FiX size={24} />
                </button>
              </div>

              <nav className="space-y-6">
                <Link href="/">
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-lg font-medium text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Inicio
                  </div>
                </Link>
                <Link href="/coleccion">
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-lg font-medium text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Colección
                  </div>
                </Link>
                <Link href="/nosotros">
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-lg font-medium text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Nosotros
                  </div>
                </Link>
                <Link href="/contacto">
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-lg font-medium text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Contacto
                  </div>
                </Link>
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                {session ? (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.user.email}
                      </p>
                    </div>
                    {session.user.role !== 'admin' && (
                      <Link href="/user/dashboard">
                        <div
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full py-3 px-4 mb-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 cursor-pointer"
                        >
                          Mi Perfil
                        </div>
                      </Link>
                    )}
                    {session.user.role === "admin" && (
                      <Link href="/admin/dashboard">
                        <div
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full py-3 px-4 mb-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 cursor-pointer"
                        >
                          Panel de Administración
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => signIn()}
                    className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                  >
                    Iniciar Sesión
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
