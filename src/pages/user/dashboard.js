import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/router';
import { FiUser, FiHeart, FiShoppingBag, FiEdit, FiLock, FiLogOut, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import PageTransition from '../../components/PageTransition';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

const UserDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { tab } = router.query;
  const { cartItems, removeFromCart, updateQuantity, getSubtotal, cartTotal } = useCart();
  const { t } = useCurrency();

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Actualizar la información del usuario cuando la sesión esté disponible
  useEffect(() => {
    if (session?.user) {
      setUserInfo({
        name: session.user.name || 'Usuario',
        email: session.user.email || '',
        phone: session.user.phone || '',
      });
    }
  }, [session]);

  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, favorites, cart

  // Inicializar activeTab desde localStorage o desde query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("activeTab");
      if (savedTab) {
        setActiveTab(savedTab);
        localStorage.removeItem("activeTab"); // Limpiar después de usar
      } else if (tab) {
        setActiveTab(tab);
      }
    }
  }, [tab]);

  // Datos de ejemplo - en producción estos vendrían de API o estado global
  const favoriteProducts = []; // Array vacío para demostrar el mensaje de "No hay productos"

  const handleChangeInfo = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Verificar que tenemos un email
      if (!userInfo.email) {
        throw new Error('No se pudo obtener el email del usuario');
      }
      
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la información');
      }
      
      // Actualizar la información del usuario con los datos de la respuesta
      if (data.user) {
        setUserInfo({
          ...userInfo,
          name: data.user.name,
          phone: data.user.phone,
        });
      }
      
      setSuccess('Información actualizada correctamente');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Verificar que tenemos un email
      if (!userInfo.email) {
        throw new Error('No se pudo obtener el email del usuario');
      }
      
      // Validaciones
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      
      if (passwordData.newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }
      
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar la contraseña');
      }
      
      setSuccess('Contraseña cambiada correctamente. Cerrando sesión...');
      
      // Cerrar sesión después de 2 segundos
      setTimeout(() => {
        signOut({ callbackUrl: '/auth/signin' });
      }, 2000);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Si no hay sesión, mostrar mensaje de carga o redirigir
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Cargando perfil...</h2>
          <p className="text-gray-600 dark:text-gray-300">Si no eres redirigido automáticamente, <Link href="/auth/signin" className="text-primary-600 hover:underline">haz clic aquí para iniciar sesión</Link>.</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Head>
          <title>Mi Perfil | ModaVista</title>
          <meta name="description" content="Administra tu cuenta y revisa tus compras en ModaVista" />
        </Head>

        <Navbar />

        <div className="container mx-auto px-4 pt-20 pb-6">
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-sm font-medium">
            <Link href="/" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Inicio
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-primary-600 dark:text-primary-400">Mi Perfil</span>
          </nav>

          {/* Mensajes de éxito o error */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md"
            >
              <p>{error}</p>
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md"
            >
              <p>{success}</p>
            </motion.div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* Menú lateral */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="md:w-1/4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <FiUser size={32} />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">{userInfo.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{userInfo.email}</p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`w-full flex items-center p-3 rounded-md transition-colors ${
                      activeTab === 'profile' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FiUser className="mr-3" />
                    <span>Mis Datos</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('favorites')} 
                    className={`w-full flex items-center p-3 rounded-md transition-colors ${
                      activeTab === 'favorites' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FiHeart className="mr-3" />
                    <span>Favoritos</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('cart')} 
                    className={`w-full flex items-center p-3 rounded-md transition-colors ${
                      activeTab === 'cart' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FiShoppingBag className="mr-3" />
                    <span>Carrito</span>
                  </button>
                  
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center p-3 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FiLogOut className="mr-3" />
                    <span>Cerrar Sesión</span>
                  </button>
                </nav>
              </div>
            </motion.div>
            
            {/* Contenido principal */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="md:w-3/4"
            >
              {/* Panel de Información Personal */}
              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Información Personal</h2>
                      {!changePassword && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setChangePassword(true)}
                          className="flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          <FiLock className="mr-1" size={16} />
                          <span>Cambiar contraseña</span>
                        </motion.button>
                      )}
                    </div>
                    
                    {!changePassword ? (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                          <input
                            type="text"
                            value={userInfo.name}
                            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                          <input
                            type="email"
                            value={userInfo.email}
                            disabled
                            className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500 mt-1">El correo electrónico no se puede modificar</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                          <input
                            type="tel"
                            value={userInfo.phone}
                            onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                            className="input-field"
                            placeholder="+54 (11) 1234-5678"
                          />
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleChangeInfo}
                          disabled={loading}
                          className="hero-button primary-button flex items-center justify-center"
                        >
                          <FiEdit className="mr-2" />
                          {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </motion.button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña Actual</label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Contraseña</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleChangePasswordSubmit}
                            disabled={loading}
                            className="hero-button primary-button"
                          >
                            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setChangePassword(false)}
                            className="hero-button secondary-button"
                          >
                            Cancelar
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Panel de Favoritos */}
              {activeTab === 'favorites' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">Mis Favoritos</h2>
                    
                    {favoriteProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteProducts.map((product) => (
                          <motion.div
                            key={product.id}
                            whileHover={{ y: -5, scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            className="card h-full flex flex-col"
                          >
                            <Link href={`/product/${product.id}`}>
                              <div className="relative h-48 w-full overflow-hidden">
                                <Image 
                                  src={product.image}
                                  alt={product.name}
                                  layout="fill"
                                  objectFit="cover"
                                  className="transition-transform duration-500 hover:scale-110"
                                />
                              </div>
                              <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                                <div className="flex mt-1 mb-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= product.rating ? "text-yellow-500" : "text-gray-300"
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <p className="text-primary-600 dark:text-primary-400 font-bold mt-auto">${product.price.toFixed(2)}</p>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mb-4">
                          <FiHeart size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hay productos en favoritos</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                          Explora nuestra colección y agrega productos a tus favoritos.
                        </p>
                        <Link href="/coleccion">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="hero-button primary-button"
                          >
                            Explorar Productos
                          </motion.button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Panel de Carrito */}
              {activeTab === 'cart' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">Mi Carrito</h2>
                    
                    {cartItems.length > 0 ? (
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id + (item.size || '')} className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div className="w-20 h-20 relative flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-md"
                              />
                            </div>
                            <div className="ml-4 flex-grow">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                              {item.size && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                  Talla: {item.size}
                                </p>
                              )}
                              <div className="flex items-center mt-2">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                  <FiMinus size={14} />
                                </button>
                                <span className="mx-2 text-gray-800 dark:text-gray-200">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                  <FiPlus size={14} />
                                </button>
                                <span className="ml-auto text-primary-600 dark:text-primary-400 font-bold">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <button 
                                  onClick={() => removeFromCart(item.id, item.size)}
                                  className="ml-2 p-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                  aria-label="Eliminar"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                          <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                          <span className="font-bold text-primary-600 dark:text-primary-400">
                            ${cartTotal.toFixed(2)}
                          </span>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="hero-button primary-button w-full mt-4"
                        >
                          Finalizar Compra
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mb-4">
                          <FiShoppingBag size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hay productos en el carrito</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                          Tu carrito está vacío. Agrega productos para continuar con la compra.
                        </p>
                        <Link href="/coleccion">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="hero-button primary-button"
                          >
                            Comprar Ahora
                          </motion.button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default UserDashboard;
