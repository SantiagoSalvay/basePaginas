import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FiSun, FiMoon, FiUser, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/router";

const DashboardNavbar = () => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
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
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
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
                  aria-label="Usuario"
                >
                  <FiUser size={20} />
                </button>
                
                {/* User dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{session.user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
                  </div>
                  <div className="py-1">
                    {session.user.role === 'admin' ? (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Panel de Administración
                      </Link>
                    ) : (
                      <Link
                        href="/user/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Mi Perfil
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        <FiLogOut className="mr-2" size={16} />
                        Cerrar Sesión
                      </div>
                    </button>
                  </div>
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
                aria-label="Iniciar sesión"
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

export default DashboardNavbar; 