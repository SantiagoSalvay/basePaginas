import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiMinus, FiPlus, FiShoppingBag, FiHeart } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import PageTransition from '../../components/PageTransition';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useFavorites } from "../../context/FavoritesContext";

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const { t } = useCurrency();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      
      // Cargar los detalles del producto
      const fetchProductDetails = async () => {
        try {
          const response = await axios.get(`/api/products/${id}`);
          setProduct(response.data);
          
          // Seleccionar la primera talla por defecto si hay tallas disponibles
          if (response.data.sizes && response.data.sizes.length > 0) {
            setSelectedSize(response.data.sizes[0]);
          }
          
          // Cargar sugerencias de productos
          try {
            const suggestionsResponse = await axios.get(`/api/products/suggestions/${id}`);
            setSuggestions(suggestionsResponse.data);
          } catch (suggestionsError) {
            console.error("Error al cargar sugerencias:", suggestionsError);
            // No mostrar error al usuario por las sugerencias, simplemente mostrar vacío
            setSuggestions([]);
          }
          
          setLoading(false);
        } catch (err) {
          console.error("Error al cargar producto:", err);
          setError("No se pudo cargar el producto solicitado.");
          setLoading(false);
        }
      };
      
      fetchProductDetails();
    }
  }, [id]);

  // Verificar si el producto está en favoritos al cargar
  useEffect(() => {
    if (product) {
      setIsFavorite(isInFavorites(product.id));
    }
  }, [product, isInFavorites]);

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!session) {
      toast.info(t('loginRequired'), {
        position: "top-center",
        autoClose: 3000,
      });
      router.push("/auth/signin");
      return;
    }

    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast.warning("Por favor selecciona una talla", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const success = addToCart(product, quantity, selectedSize);
    
    if (success) {
      toast.success(`${product.name} ${t('addToCart').toLowerCase()}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleFavoriteToggle = () => {
    if (!session) {
      toast.info(t('loginRequired'), {
        position: "top-center",
        autoClose: 3000,
      });
      router.push("/auth/signin");
      return;
    }

    if (isFavorite) {
      removeFromFavorites(product.id);
      setIsFavorite(false);
      toast.success(`${product.name} ${t('removedFromWishlist').toLowerCase()}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      const success = addToFavorites(product);
      if (success) {
        setIsFavorite(true);
        toast.success(`${product.name} ${t('addToWishlist').toLowerCase()}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-indigo-600 font-medium">Cargando...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl text-red-600 mb-4">Error</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
      <Link href="/coleccion">
        <button className="hero-button primary-button">Ver todos los productos</button>
      </Link>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl mb-4">Producto no encontrado</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">No pudimos encontrar el producto que estás buscando.</p>
      <Link href="/coleccion">
        <button className="hero-button primary-button">Ver todos los productos</button>
      </Link>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Head>
          <title>{product?.name || 'Detalles del producto'} | ModaVista</title>
          <meta name="description" content={product?.description || 'Detalles del producto en ModaVista'} />
        </Head>

        <Navbar />

        <div className="container mx-auto px-4 py-10">
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-sm font-medium mt-8">
            <Link href="/" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
              Inicio
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/coleccion" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
              Productos
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-indigo-600 dark:text-indigo-400">{product.name}</span>
          </nav>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
          >
            {/* Imagen del producto */}
            <div className="md:w-1/2">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-lg"
              >
                <Image 
                  src={product.image || "https://via.placeholder.com/500x600?text=Imagen+no+disponible"} 
                  alt={product.name} 
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                  priority
                />
                <div className="absolute top-0 right-0 bg-primary-600 bg-opacity-90 text-white px-3 py-1 m-2 rounded-full text-sm">
                  {product.category || "Producto"}
                </div>
              </motion.div>
            </div>
            
            {/* Información del producto */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:w-1/2"
            >
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>
              
              <div className="mb-6">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">${product.price.toFixed(2)} {product.currency}</p>
              </div>
              
              {/* Calificación */}
              <div className="flex items-center mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= product.rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-500 ml-2">(24 reseñas)</span>
              </div>
              
              {/* Tallas disponibles */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Tallas disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <motion.button
                        key={size}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 border rounded-md focus:outline-none transition-colors ${
                          selectedSize === size
                            ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-400"
                            : "border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400"
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Selector de cantidad */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Cantidad</h3>
                <div className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiMinus />
                  </motion.button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 py-2 px-3 text-center border-t border-b border-gray-300 dark:border-gray-600 focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiPlus />
                  </motion.button>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">
                    <FiShoppingBag />
                  </span>
                  Agregar al Carrito
                </button>
                <button
                  onClick={handleFavoriteToggle}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">
                    <FiHeart />
                  </span>
                  Favorito
                </button>
              </div>
              
              {/* Información adicional */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Información del producto:</h3>
                <ul className="text-sm space-y-1">
                  <li>✓ Envío gratis a todo el país</li>
                  <li>✓ Garantía de calidad</li>
                  <li>✓ Devoluciones sin cargo</li>
                  <li>✓ Métodos de pago seguros</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Sugerencias de productos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
          >
            <h2 className="section-title dark:text-white text-center">Productos recomendados para ti</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  whileHover={{ y: -5, scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="card"
                >
                  <Link href={`/product/${suggestion.id}`}>
                    <div className="h-full flex flex-col">
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={suggestion.image || "https://via.placeholder.com/300x400?text=Imagen+no+disponible"}
                          alt={suggestion.name}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{suggestion.name}</h3>
                        <div className="flex mt-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3 h-3 ${
                                star <= suggestion.rating ? "text-yellow-500" : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-primary-600 dark:text-primary-400 font-bold mt-auto">${suggestion.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </PageTransition>
  );
};

export default ProductDetail; 