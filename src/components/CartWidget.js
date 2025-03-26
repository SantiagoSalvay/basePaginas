import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatPrice } from '../utils/currencyUtils';
import { useRouter } from 'next/router';

const CartWidget = () => {
  const { cartItems, cartCount, removeFromCart, updateQuantity, clearCart, getSubtotal } = useCart();
  const { currency, t } = useCurrency();
  const [processingOrder, setProcessingOrder] = useState(false);
  const router = useRouter();

  // Para obtener la URL de imagen según su formato
  const getImageUrl = (imageUrl) => {
    if (imageUrl?.startsWith('http')) {
      return `${imageUrl}?auto=format&q=80&fit=crop&w=150&h=180`;
    }
    return imageUrl || 'https://via.placeholder.com/150x180';
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="flex justify-center mb-4">
          <FiShoppingBag size={60} className="text-gray-400 dark:text-gray-600" />
        </div>
        <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-6">Tu carrito está vacío</h2>
        <Link href="/coleccion">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hero-button primary-button flex items-center justify-center mx-auto"
          >
            Ir a la tienda <FiArrowRight className="ml-2" />
          </motion.button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Items del carrito */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div 
            key={`${item.id}-${item.size || 'default'}`} 
            className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <div className="relative w-16 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
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
              {item.size && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Talla: {item.size}
                </p>
              )}
              <div className="mt-1 flex justify-between items-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatPrice(item.price, currency)}
                </p>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={() => removeFromCart(item.id, item.size)}
              className="ml-4 p-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-full"
              aria-label="Remove"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Acciones del carrito */}
      <div className="flex justify-between border-t border-b py-3 border-gray-200 dark:border-gray-700">
        <button 
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-800 flex items-center"
        >
          <FiTrash2 size={16} className="mr-1" /> Vaciar carrito
        </button>
        <span className="text-sm font-medium">
          {cartCount} {cartCount === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {/* Resumen y Checkout */}
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatPrice(getSubtotal(), currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Envío</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatPrice(0, currency)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{formatPrice(getSubtotal(), currency)}</span>
          </div>
        </div>
        <div className="mt-4">
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
                Procesando...
              </>
            ) : (
              <>Proceder al pago</>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CartWidget; 