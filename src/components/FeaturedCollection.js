import { useState, useEffect } from 'react';
import { FiTrash2, FiPlus, FiSearch, FiEye } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const FeaturedCollection = () => {
  const [productId, setProductId] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [previewMode, setPreviewMode] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [featuredRes, productsRes] = await Promise.all([
        axios.get('/api/featured-products'),
        axios.get('/api/products')
      ]);

      const products = Object.values(productsRes.data).flat();
      setAllProducts(products);

      const featuredIds = featuredRes.data;
      const featured = products.filter(p => featuredIds.includes(p.id));
      setFeaturedProducts(featured);
      
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const addToFeatured = async () => {
    if (!productId) {
      showNotification('Por favor, introduce un ID de producto válido', 'error');
      return;
    }

    try {
      const numericId = parseInt(productId, 10);
      const productToAdd = allProducts.find(p => p.id === numericId);

      if (!productToAdd) {
        showNotification('El producto con ese ID no existe', 'error');
        return;
      }

      if (featuredProducts.some(p => p.id === numericId)) {
        showNotification('Este producto ya está en la colección destacada', 'error');
        return;
      }

      // Actualizar UI inmediatamente
      setFeaturedProducts(prev => [...prev, productToAdd]);
      showNotification('Producto añadido a la colección destacada', 'success');

      // Actualizar backend
      await axios.post('/api/featured-products', { productId: numericId });
      setProductId('');
    } catch (err) {
      console.error('Error al añadir producto:', err);
      // Revertir cambios en caso de error
      await loadProducts();
      showNotification('Error al añadir el producto', 'error');
    }
  };

  const removeFromFeatured = async (id) => {
    try {
      const numericId = parseInt(id, 10);
      
      // Actualizar UI inmediatamente
      setFeaturedProducts(prev => prev.filter(p => p.id !== numericId));
      showNotification('Producto eliminado de la colección destacada', 'success');

      // Actualizar backend
      await axios.delete('/api/featured-products', {
        data: { productId: numericId }
      });
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      // Revertir cambios en caso de error
      await loadProducts();
      showNotification('Error al eliminar el producto', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Colección Destacada
        </h2>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={`flex items-center px-4 py-2 rounded-md transition-colors duration-300 ${
            previewMode 
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <FiEye className="mr-2" />
          {previewMode ? 'Ocultar Vista Previa' : 'Mostrar Vista Previa'}
        </button>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Gestiona los productos que aparecen en el carousel de la página principal
      </p>
      
      <AnimatePresence>
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-3 mb-4 rounded-lg ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center mb-6">
        <div className="flex-1 mr-4">
          <label htmlFor="productId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ID del Producto
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="number"
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              placeholder="Introduce el ID del producto"
            />
          </div>
        </div>
        <button
          onClick={addToFeatured}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors duration-300 mt-5"
        >
          <FiPlus className="mr-2" />
          Añadir
        </button>
      </div>
      
      {previewMode && featuredProducts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Vista Previa del Carousel</h3>
          <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div 
              className="flex gap-4 animate-carousel hover:pause-animation"
              style={{
                width: `${featuredProducts.length * 3 * 260}px`
              }}
            >
              {[...featuredProducts, ...featuredProducts, ...featuredProducts].map((product, index) => (
                <div 
                  key={`preview-${product.id}-${index}`} 
                  className="w-[250px] flex-shrink-0 carousel-item"
                  onMouseEnter={(e) => {
                    e.currentTarget.parentElement.style.animationPlayState = 'paused';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.parentElement.style.animationPlayState = 'running';
                  }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm h-full">
                    <div className="h-32 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{product.price.toFixed(2)} €</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
            * Esta es una vista previa del carousel que aparece en la página principal
          </p>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Productos en la Colección Destacada</h3>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 dark:bg-red-900 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      ) : featuredProducts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No hay productos en la colección destacada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {featuredProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout
                className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {product.id}
                      </p>
                      <p className="text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                        {product.price.toFixed(2)} €
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromFeatured(product.id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-300"
                      title="Eliminar de la colección destacada"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FeaturedCollection;
