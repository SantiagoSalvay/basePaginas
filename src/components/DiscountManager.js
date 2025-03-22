import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPercent, FiTag, FiShoppingBag, FiCheckCircle, FiXCircle, FiRefreshCw, FiInfo } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "axios";
import Image from "next/image";

const DiscountManager = () => {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [categories, setCategories] = useState(["Todas"]);
  const [persistenceStatus, setPersistenceStatus] = useState(null);
  
  // Cargar productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/products");
      setProducts(response.data);
      
      // Extraer categorías únicas
      const uniqueCategories = ["Todas", ...Object.keys(response.data)];
      setCategories(uniqueCategories);
      
      // Convertir productos de objeto por categoría a un array plano para filtrado
      const allProducts = Object.values(response.data).flat();
      setFilteredProducts(allProducts);
      
      // Verificar la persistencia de datos
      checkPersistence();
      
      setLoading(false);
      setError("");
    } catch (err) {
      setError("Error al cargar los productos");
      setLoading(false);
      console.error(err);
    }
  };
  
  // Verificar el estado de persistencia
  const checkPersistence = async () => {
    try {
      const response = await axios.get("/api/test-persistence");
      setPersistenceStatus(response.data);
      console.log("Estado de persistencia:", response.data);
    } catch (err) {
      console.error("Error al verificar persistencia:", err);
    }
  };
  
  // Inicializar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Función para actualizar la lista de productos
  const refreshProducts = () => {
    fetchProducts();
    toast.info("Lista de productos actualizada");
  };
  
  // Filtrar productos cuando cambia la categoría o el término de búsqueda
  useEffect(() => {
    let result = [];
    
    // Si seleccionamos "Todas", usamos todos los productos
    if (selectedCategory === "Todas") {
      result = Object.values(products).flat();
    } else {
      // Si no, filtramos por la categoría seleccionada
      result = products[selectedCategory] || [];
    }
    
    // Aplicar filtro de búsqueda
    if (searchTerm.trim()) {
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.id.toString().includes(searchTerm)
      );
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, products]);

  // Aplicar descuento a un producto
  const applyDiscount = async (product, discountPercentage) => {
    try {
      console.log("⭐ [Admin] Aplicando descuento:", {
        id: product.id,
        name: product.name,
        originalPrice: product.originalPrice || product.price,
        percentage: discountPercentage,
        isStatic: product.id >= 1001 && product.id <= 5999
      });
      
      // Usar la nueva API de descuentos persistente
      const response = await axios.post("/api/apply-discount", {
        id: product.id,
        discount: {
          percentage: discountPercentage
        }
      });
      
      console.log("✅ [Admin] Respuesta del servidor:", response.data);
      
      // Actualizar la lista completa de productos
      fetchProducts();
      
      toast.success(`Descuento del ${discountPercentage}% aplicado a ${product.name}`);
    } catch (error) {
      console.error("❌ [Admin] Error al aplicar descuento:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        toast.error(`Error al aplicar el descuento: ${error.response.data.error || "Error desconocido"}`);
      } else {
        toast.error("Error al aplicar el descuento");
      }
    }
  };

  // Eliminar descuento de un producto
  const removeDiscount = async (product) => {
    try {
      // Crear una copia del producto
      const productCopy = { ...product };
      
      // Asegurarse de que sizes sea un array y no esté vacío
      if (!productCopy.sizes || !Array.isArray(productCopy.sizes) || productCopy.sizes.length === 0) {
        // Si no tiene tallas, agregar una por defecto
        productCopy.sizes = ["U"];  // U de "Universal" o "Único"
      }
      
      // Asegurarse de que tiene una moneda válida
      const validCurrencies = ["ARS", "USD", "EUR", "PYG", "BRL"];
      if (!productCopy.currency || !validCurrencies.includes(productCopy.currency)) {
        productCopy.currency = "ARS"; // Establecer ARS como valor predeterminado
      }
      
      // Restablecer el precio original
      if (productCopy.originalPrice) {
        productCopy.price = productCopy.originalPrice;
        delete productCopy.originalPrice;
      }
      
      // Eliminar la información de descuento o marcarlo como inactivo
      productCopy.discount = {
        active: false,
        percentage: 0
      };
      
      // Enviar la actualización al servidor
      const response = await axios.put("/api/products", productCopy);
      
      // Actualizar la lista completa de productos
      fetchProducts();
      
      toast.success(`Descuento eliminado de ${product.name}`);
    } catch (error) {
      console.error("Error al eliminar descuento:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        toast.error(`Error al eliminar el descuento: ${error.response.data.error || "Error desconocido"}`);
      } else {
        toast.error("Error al eliminar el descuento");
      }
    }
  };

  // Opciones de descuento
  const discountOptions = [10, 15, 25, 50];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestor de Ofertas
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={refreshProducts}
              className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors duration-300"
            >
              <FiRefreshCw className="mr-2" />
              Actualizar
            </button>
            
            {persistenceStatus && persistenceStatus.productsWithDiscounts?.length > 0 && (
              <button 
                onClick={() => {
                  if (window.confirm(`¿Estás seguro de que deseas eliminar TODOS los descuentos (${persistenceStatus.productsWithDiscounts.length} productos)?`)) {
                    axios.post('/api/reset-discounts', { confirm: 'RESET_DISCOUNTS' })
                      .then(response => {
                        toast.success(response.data.message);
                        fetchProducts();
                      })
                      .catch(error => {
                        console.error('Error al reiniciar descuentos:', error);
                        toast.error('Error al reiniciar los descuentos');
                      });
                  }
                }}
                className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-300"
              >
                <FiXCircle className="mr-2" />
                Eliminar todos
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Aplica descuentos a los productos seleccionando el porcentaje de descuento deseado.
        </p>
        
        {/* Filtros */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar productos
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre o ID del producto"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por categoría
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 hover:scale-110"
                />
                {product.discount && product.discount.active && (
                  <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 rounded-br-lg">
                    <span className="font-bold">{product.discount.percentage}% OFF</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-800 dark:text-gray-300 rounded">
                    {product.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {product.id}
                  </span>
                </div>
                
                <div className="flex items-center mb-4">
                  {product.discount && product.discount.active ? (
                    <>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeDiscount(product)}
                        className="ml-auto px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                        title="Eliminar descuento"
                      >
                        <FiXCircle />
                      </button>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {discountOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => applyDiscount(product, option)}
                      disabled={product.discount && product.discount.active && product.discount.percentage === option}
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center 
                        ${product.discount && product.discount.active && product.discount.percentage === option
                          ? 'bg-green-100 text-green-600 cursor-default'
                          : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                    >
                      <FiPercent className="mr-1" />
                      {option}%
                      {product.discount && product.discount.active && product.discount.percentage === option && (
                        <FiCheckCircle className="ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {filteredProducts.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay productos</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron productos con los filtros actuales.
          </p>
        </div>
      )}
    </div>
  );
};

export default DiscountManager; 