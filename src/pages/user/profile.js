import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiUser, FiClock, FiHeart, FiSettings, FiLogOut } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageTransition from '../../components/PageTransition';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatPrice } from '../../utils/currencyUtils';

const ProfileTabs = {
  CART: 'cart',
  ORDERS: 'orders',
  FAVORITES: 'favorites',
  SETTINGS: 'settings'
};

const UserProfile = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState(ProfileTabs.CART);
  const { cartItems, cartCount, removeFromCart, updateQuantity, clearCart, getSubtotal } = useCart();
  const { currency, t } = useCurrency();

  // Protección de ruta
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  // Para obtener la URL de imagen según su formato
  const getImageUrl = (imageUrl) => {
    if (imageUrl?.startsWith('http')) {
      return `${imageUrl}?auto=format&q=80&fit=crop&w=120&h=150`;
    }
    return imageUrl || 'https://via.placeholder.com/120x150';
  };

  // Si la sesión está cargando o no está autenticado
  if (status === 'loading' || !session) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Contenido para la pestaña de carrito
  const renderCart = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('cart')} ({cartCount})
        </h3>
        {cartItems.length > 0 && (
          <Link href="/cart">
            <button className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
              {t('viewFullCart')}
            </button>
          </Link>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <FiShoppingBag size={30} className="text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('emptyCart')}</p>
          <Link href="/coleccion">
            <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              {t('exploreProducts')}
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div 
                key={`${item.id}-${item.size || 'default'}`}
                className="flex items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="relative w-16 h-20 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                  <Image 
                    src={getImageUrl(item.image)} 
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>

                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</h4>
                    <button 
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="text-gray-500 hover:text-red-600"
                      aria-label="Remove"
                    >
                      &times;
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.category}
                    {item.size && ` · ${t('size')}: ${item.size}`}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                        className="px-2 py-1 text-gray-600 dark:text-gray-400"
                      >
                        -
                      </button>
                      <span className="px-2 text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                        className="px-2 py-1 text-gray-600 dark:text-gray-400"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatPrice(getSubtotal(), currency)}
              </span>
            </div>
            <Link href="/checkout">
              <button className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                {t('proceedToCheckout')}
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );

  // Contenido para la pestaña de pedidos
  const renderOrders = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('myOrders')}</h3>
      <div className="text-center py-10">
        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <FiClock size={30} className="text-gray-500 dark:text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">No tienes pedidos recientes</p>
      </div>
    </div>
  );

  // Contenido para la pestaña de favoritos
  const renderFavorites = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('myWishlist')}</h3>
      <div className="text-center py-10">
        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <FiHeart size={30} className="text-gray-500 dark:text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">No tienes productos en tu lista de favoritos</p>
        <Link href="/coleccion">
          <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            {t('exploreProducts')}
          </button>
        </Link>
      </div>
    </div>
  );

  // Contenido para la pestaña de configuración
  const renderSettings = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('settings')}</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">{t('personalInformation')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('firstName')}</label>
              <input 
                type="text" 
                value={session.user.name?.split(' ')[0] || ''} 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('lastName')}</label>
              <input 
                type="text" 
                value={session.user.name?.split(' ')[1] || ''} 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('email')}</label>
              <input 
                type="email" 
                value={session.user.email || ''} 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                readOnly
              />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">{t('changePassword')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('currentPassword')}</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('newPassword')}</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('confirmPassword')}</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            {t('updatePassword')}
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar la pestaña activa
  const renderActiveTab = () => {
    switch (activeTab) {
      case ProfileTabs.CART:
        return renderCart();
      case ProfileTabs.ORDERS:
        return renderOrders();
      case ProfileTabs.FAVORITES:
        return renderFavorites();
      case ProfileTabs.SETTINGS:
        return renderSettings();
      default:
        return renderCart();
    }
  };

  return (
    <div className="page-transition">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Head>
          <title>{t('myAccount')} | ModaVista</title>
        </Head>

        <Navbar />

        <main className="container mx-auto px-4 pt-20 pb-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                {t('myAccount')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('welcome')}, {session.user.name}
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar */}
              <div className="md:w-1/4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name}
                          width={56}
                          height={56}
                          className="rounded-full"
                        />
                      ) : (
                        <FiUser size={30} />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {session.user.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  
                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveTab(ProfileTabs.CART)}
                      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        activeTab === ProfileTabs.CART 
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FiShoppingBag className="mr-3 flex-shrink-0" />
                      <span>{t('cart')}</span>
                      {cartCount > 0 && (
                        <span className="ml-auto bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setActiveTab(ProfileTabs.ORDERS)}
                      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        activeTab === ProfileTabs.ORDERS 
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FiClock className="mr-3 flex-shrink-0" />
                      <span>{t('myOrders')}</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab(ProfileTabs.FAVORITES)}
                      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        activeTab === ProfileTabs.FAVORITES 
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FiHeart className="mr-3 flex-shrink-0" />
                      <span>{t('favorites')}</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab(ProfileTabs.SETTINGS)}
                      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        activeTab === ProfileTabs.SETTINGS 
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FiSettings className="mr-3 flex-shrink-0" />
                      <span>{t('settings')}</span>
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="md:w-3/4">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderActiveTab()}
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default UserProfile;

// Deshabilitar SSG para esta página
export async function getServerSideProps() {
  return {
    props: {}
  };
} 