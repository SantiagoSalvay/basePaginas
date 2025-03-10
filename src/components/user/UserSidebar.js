import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiUser, FiHeart, FiShoppingBag, FiSettings, FiLogOut } from 'react-icons/fi';
import { signOut } from 'next-auth/react';

const UserSidebar = ({ activeTab }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <FiUser className="mr-3" size={20} />,
      path: '/user/dashboard',
      id: 'dashboard'
    },
    {
      name: 'Mi Perfil',
      icon: <FiUser className="mr-3" size={20} />,
      path: '/user/dashboard',
      id: 'profile'
    },
    {
      name: 'Favoritos',
      icon: <FiHeart className="mr-3" size={20} />,
      path: '/user/dashboard/favorites',
      id: 'favorites'
    },
    {
      name: 'Mis Compras',
      icon: <FiShoppingBag className="mr-3" size={20} />,
      path: '/user/dashboard/orders',
      id: 'orders'
    },
    {
      name: 'Configuración',
      icon: <FiSettings className="mr-3" size={20} />,
      path: '/user/dashboard/settings',
      id: 'settings'
    }
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 bg-primary-600 dark:bg-primary-700">
        <h2 className="text-xl font-bold text-white">Mi Cuenta</h2>
        <p className="text-primary-100 text-sm mt-1">Gestiona tu perfil y pedidos</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link href={item.path}>
                <div
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            </li>
          ))}
          
          <li className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiLogOut className="mr-3" size={20} />
              <span className="font-medium">
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default UserSidebar;
