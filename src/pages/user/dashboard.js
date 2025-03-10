import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Footer from '../../components/Footer';
import { useRouter } from 'next/router';

const UserDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();

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

  const favoriteProducts = [
    { id: 1, name: 'Producto 1', price: 29.99, image: 'product1.jpg', rating: 4.5 },
    { id: 2, name: 'Producto 2', price: 19.99, image: 'product2.jpg', rating: 4.0 },
  ];

  const purchases = [
    { id: 1, product: 'Producto 1', date: '2025-02-01', amount: 29.99, image: 'product1.jpg', rating: 4.5 },
    { id: 2, product: 'Producto 2', date: '2025-02-15', amount: 19.99, image: 'product2.jpg', rating: 4.0 },
  ];

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
      
      // Ya no es necesario recargar la página, los datos se mantienen actualizados
      // Comentamos esta parte para que no se pierdan los cambios en pantalla
      /*
      if (typeof window !== 'undefined') {
        router.replace(router.asPath);
      }
      */
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Cargando perfil...</h2>
          <p>Si no eres redirigido automáticamente, <a href="/auth/signin" className="text-blue-500 hover:underline">haz clic aquí para iniciar sesión</a>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <motion.div
        className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 transition-all duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Mi Perfil</h1>

        {/* Mensajes de éxito o error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Sección de Información Personal */}
        <section className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Información Personal</h2>
          
          {!changePassword ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled // El email no se puede cambiar por seguridad
                />
                <p className="text-xs text-gray-500 mt-1">El correo electrónico no se puede modificar</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleChangeInfo}
                  disabled={loading}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={() => setChangePassword(true)}
                  className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                >
                  Cambiar Contraseña
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña Actual</label>
                <input
                  type="text"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña</label>
                <input
                  type="text"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="text"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleChangePasswordSubmit}
                  disabled={loading}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
                <button
                  onClick={() => setChangePassword(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </section>

        {/* Sección de Productos Favoritos */}
        <section className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Productos Favoritos</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteProducts.map(product => (
              <li key={product.id} className="border rounded-lg p-4 flex flex-col items-center">
                <img src={`/images/${product.image}`} alt={product.name} className="h-32 w-32 object-cover mb-2" />
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                <p className="text-sm text-yellow-500">Rating: {product.rating} ⭐</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Sección de Compras Realizadas */}
        <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Compras Realizadas</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchases.map(purchase => (
              <li key={purchase.id} className="border rounded-lg p-4 flex flex-col items-center">
                <img src={`/images/${purchase.image}`} alt={purchase.product} className="h-32 w-32 object-cover mb-2" />
                <h3 className="text-lg font-semibold">{purchase.product}</h3>
                <p className="text-sm text-gray-600">${purchase.amount.toFixed(2)}</p>
                <p className="text-sm text-yellow-500">Rating: {purchase.rating} ⭐</p>
                <p className="text-sm text-gray-500">Comprado el: {purchase.date}</p>
              </li>
            ))}
          </ul>
        </section>

        <Footer />
      </motion.div>
    </div>
  );
};

export default UserDashboard;
