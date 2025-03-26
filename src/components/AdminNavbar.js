import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FiSun, FiMoon, FiUser, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/router";

const AdminNavbar = () => {
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
          <Link href="/admin/dashboard">
            <div className="flex items-center cursor-pointer">
              <h1
                className={`text-lg sm:text-xl md:text-2xl font-display font-bold ${
                  scrolled || theme === "dark"
                    ? "text-primary-600 dark:text-white"
                    : "text-white"
                }`}
              >
                ModaVista Admin
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

            {/* Admin Info */}
            {session && (
              <div className="flex items-center">
                <div
                  className={`hidden md:block mr-2 text-sm font-medium ${
                    scrolled || theme === "dark"
                      ? "text-gray-800 dark:text-white"
                      : "text-white"
                  }`}
                >
                  {session.user.name || session.user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                    scrolled || theme === "dark"
                      ? "text-gray-800 dark:text-white"
                      : "text-white"
                  }`}
                  aria-label="Cerrar sesión"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar; 