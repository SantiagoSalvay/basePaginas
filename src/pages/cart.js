import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatPrice } from '../utils/currencyUtils';

const Cart = () => {
  const { cartItems, cartCount, removeFromCart, updateQuantity, clearCart, getSubtotal } = useCart();
  const { currency, t } = useCurrency();
  const [processingOrder, setProcessingOrder] = useState(false);

  // Para obtener la URL de imagen según su formato
  const getImageUrl = (imageUrl) => {
    if (imageUrl?.startsWith('http')) {
      return `${imageUrl}?auto=format&q=80&fit=crop&w=150&h=180`;
    }
    return imageUrl || 'https://via.placeholder.com/150x180';
  };

  const handleCheckout = () => {
    setProcessingOrder(true);
    
    // Aquí se implementaría la lógica para procesar el pedido
    setTimeout(() => {
      // Simulación de proceso exitoso
      clearCart();
      setProcessingOrder(false);
      // Redireccionar a una página de confirmación o agradecimiento
    }, 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Head>
          <title>{t('cart')} | ModaVista</title>
        </Head>

        <Navbar />

        <main className="container mx-auto px-4 pt-20 pb-10">
          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FiShoppingBag className="mr-2" /> {t('cart')}
                {cartCount > 0 && (
                  <span className="ml-2 text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 px-2 py-1 rounded-full">
                    {cartCount} {cartCount === 1 ? t('item') : t('items')}
                  </span>
                )}
              </h1>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                {cartItems.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="flex justify-center mb-4">
                      <FiShoppingBag size={60} className="text-gray-400 dark:text-gray-600" />
                    </div>
                    <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-6">{t('emptyCart')}</h2>
                    <Link href="/coleccion">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="hero-button primary-button flex items-center justify-center mx-auto"
                      >
                        <FiArrowLeft className="mr-2" /> {t('continueShopping')}
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Encabezados de tabla en desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                      <div className="col-span-6">{t('product')}</div>
                      <div className="col-span-2 text-center">{t('price')}</div>
                      <div className="col-span-2 text-center">{t('quantity')}</div>
                      <div className="col-span-2 text-right">{t('subtotal')}</div>
                    </div>

                    {/* Items del carrito */}
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div 
                          key={`${item.id}-${item.size || 'default'}`} 
                          className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 border-b border-gray-200 dark:border-gray-700 items-center"
                        >
                          {/* Producto (mobile y desktop) */}
                          <div className="col-span-1 md:col-span-6">
                            <div className="flex items-center">
                              <div className="relative w-20 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                                <Image 
                                  src={getImageUrl(item.image)} 
                                  alt={item.name}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.name}
                                </h3>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {item.category}
                                </p>
                                {item.size && (
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {t('size')}: {item.size}
                                  </p>
                                )}
                                {/* Precio y cantidad (solo mobile) */}
                                <div className="md:hidden mt-2 flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatPrice(item.price, currency)}
                                  </p>
                                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                    >
                                      <FiMinus size={14} />
                                    </button>
                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                    >
                                      <FiPlus size={14} />
                                    </button>
                                  </div>
                                </div>
                                {/* Botón eliminar (solo mobile) */}
                                <button 
                                  onClick={() => removeFromCart(item.id, item.size)}
                                  className="md:hidden mt-2 text-xs text-red-600 hover:text-red-800 flex items-center"
                                >
                                  <FiTrash2 size={14} className="mr-1" /> {t('remove')}
                                </button>
                              </div>
                              {/* Botón eliminar (solo desktop) */}
                              <button 
                                onClick={() => removeFromCart(item.id, item.size)}
                                className="hidden md:block ml-4 text-gray-400 hover:text-red-600"
                                aria-label="Remove"
                              >
                                <FiX size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Precio unitario (solo desktop) */}
                          <div className="hidden md:block md:col-span-2 text-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {formatPrice(item.price, currency)}
                          </div>

                          {/* Cantidad (solo desktop) */}
                          <div className="hidden md:flex md:col-span-2 justify-center">
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                <FiMinus size={16} />
                              </button>
                              <span className="w-10 text-center text-sm text-gray-700 dark:text-gray-300">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                <FiPlus size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal (solo desktop) */}
                          <div className="hidden md:block md:col-span-2 text-right text-sm text-gray-900 dark:text-white font-medium">
                            {formatPrice(item.price * item.quantity, currency)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Acciones del carrito */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="mb-4 md:mb-0">
                        <button 
                          onClick={clearCart}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                        >
                          <FiTrash2 size={16} className="mr-1" /> {t('clearCart')}
                        </button>
                      </div>
                      <Link href="/coleccion">
                        <button className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
                          <FiArrowLeft size={16} className="mr-1" /> {t('continueShopping')}
                        </button>
                      </Link>
                    </div>

                    {/* Resumen y Checkout */}
                    <div className="mt-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('orderSummary')}</h2>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                          <span className="text-gray-900 dark:text-white font-medium">{formatPrice(getSubtotal(), currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('shipping')}</span>
                          <span className="text-gray-900 dark:text-white font-medium">{formatPrice(0, currency)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('total')}</span>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">{formatPrice(getSubtotal(), currency)}</span>
                        </div>
                      </div>
                      <div className="mt-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCheckout}
                          disabled={processingOrder}
                          className="w-full hero-button primary-button flex items-center justify-center"
                        >
                          {processingOrder ? (
                            <>
                              <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              {t('processing')}
                            </>
                          ) : (
                            <>{t('proceedToCheckout')}</>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Cart; 