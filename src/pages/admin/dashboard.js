import { useState, useEffect } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FiPlus, FiList, FiRefreshCw, FiUsers, FiShoppingBag, FiDollarSign, FiStar } from "react-icons/fi";

// Componentes
import Navbar from "../../components/Navbar";
import AdminProtected from "../../components/AdminProtected";
import ProductForm from "../../components/ProductForm";
import ProductList from "../../components/ProductList";
import AnimatedSection from "../../components/AnimatedSection";
import FeaturedCollection from "../../components/FeaturedCollection";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("add");
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    categories: 0,
    averagePrice: 0
  });

  // Cargar productos al iniciar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Inicializar productos (solo en desarrollo)
        await fetch("/api/products/init");
        
        // Obtener productos
        const response = await fetch("/api/products");
        
        if (!response.ok) {
          throw new Error("Error al cargar productos");
        }
        
        const data = await response.json();
        setProducts(data);
        
        // Calcular estadísticas
        const allProducts = Object.values(data).flat();
        const totalProducts = allProducts.length;
        const categories = Object.keys(data).length;
        const totalPrice = allProducts.reduce((sum, product) => sum + product.price, 0);
        const averagePrice = totalProducts > 0 ? totalPrice / totalProducts : 0;
        
        setStats({
          totalProducts,
          categories,
          averagePrice
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Manejar la adición de un nuevo producto
  const handleProductAdded = (newProduct) => {
    setProducts(prevProducts => {
      const category = newProduct.category;
      return {
        ...prevProducts,
        [category]: [...(prevProducts[category] || []), newProduct]
      };
    });
    
    // Actualizar estadísticas
    setStats(prevStats => {
      const allProducts = Object.values({
        ...products,
        [newProduct.category]: [...(products[newProduct.category] || []), newProduct]
      }).flat();
      
      const totalProducts = allProducts.length;
      const categories = Object.keys(products).length;
      const totalPrice = allProducts.reduce((sum, product) => sum + product.price, 0);
      const averagePrice = totalProducts > 0 ? totalPrice / totalProducts : 0;
      
      return {
        totalProducts,
        categories,
        averagePrice
      };
    });
  };

  // Manejar la eliminación de un producto
  const handleProductDeleted = (deletedProductId) => {
    setProducts(prevProducts => {
      const newProducts = {};
      
      // Filtrar el producto eliminado de todas las categorías
      Object.keys(prevProducts).forEach(category => {
        const filteredProducts = prevProducts[category].filter(product => product.id !== deletedProductId);
        if (filteredProducts.length > 0) {
          newProducts[category] = filteredProducts;
        }
      });
      
      return newProducts;
    });
    
    // Actualizar estadísticas
    updateStats();
  };

  // Manejar la actualización de un producto
  const handleProductUpdated = (updatedProduct) => {
    setProducts(prevProducts => {
      const newProducts = { ...prevProducts };
      let found = false;
      
      // Buscar y actualizar el producto en su categoría
      Object.keys(newProducts).forEach(category => {
        const index = newProducts[category].findIndex(p => p.id === updatedProduct.id);
        
        if (index !== -1) {
          // Si la categoría cambió
          if (category !== updatedProduct.category) {
            // Eliminar de la categoría actual
            newProducts[category] = newProducts[category].filter(p => p.id !== updatedProduct.id);
            
            // Añadir a la nueva categoría
            if (!newProducts[updatedProduct.category]) {
              newProducts[updatedProduct.category] = [];
            }
            newProducts[updatedProduct.category].push(updatedProduct);
          } else {
            // Actualizar en la misma categoría
            newProducts[category][index] = updatedProduct;
          }
          
          found = true;
        }
      });
      
      // Si no se encontró, podría ser un producto nuevo
      if (!found) {
        if (!newProducts[updatedProduct.category]) {
          newProducts[updatedProduct.category] = [];
        }
        newProducts[updatedProduct.category].push(updatedProduct);
      }
      
      return newProducts;
    });
    
    // Actualizar estadísticas
    updateStats();
  };

  // Actualizar estadísticas basadas en los productos actuales
  const updateStats = () => {
    const allProducts = Object.values(products).flat();
    const totalProducts = allProducts.length;
    const categories = Object.keys(products).length;
    const totalPrice = allProducts.reduce((sum, product) => sum + product.price, 0);
    const averagePrice = totalProducts > 0 ? totalPrice / totalProducts : 0;
    
    setStats({
      totalProducts,
      categories,
      averagePrice
    });
  };

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Head>
          <title>Panel de Administración | ModaVista</title>
          <meta name="description" content="Panel de administración de ModaVista" />
        </Head>

        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Panel de Administración
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Bienvenido, {session?.user?.name || "Administrador"}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors duration-300"
                >
                  <FiRefreshCw className="mr-2" />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <AnimatedSection animation="fadeIn" className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 mr-4">
                      <FiShoppingBag size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Productos</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalProducts}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 mr-4">
                      <FiList size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Categorías</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.categories}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 mr-4">
                      <FiDollarSign size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Precio Medio</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.averagePrice.toFixed(2)} €
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
              <button
                onClick={() => setActiveTab("add")}
                className={`py-4 px-6 text-sm font-medium flex items-center ${
                  activeTab === "add"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FiPlus className="mr-2" />
                Añadir Producto
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className={`py-4 px-6 text-sm font-medium flex items-center ${
                  activeTab === "list"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FiList className="mr-2" />
                Gestionar Productos
              </button>
              <button
                onClick={() => setActiveTab("featured")}
                className={`py-4 px-6 text-sm font-medium flex items-center ${
                  activeTab === "featured"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FiStar className="mr-2" />
                Colección Destacada
              </button>
            </div>

            {/* Contenido de las tabs */}
            <AnimatedSection animation="fadeIn">
              {activeTab === "add" ? (
                <ProductForm onProductAdded={handleProductAdded} />
              ) : activeTab === "list" ? (
                <>
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                      {error}
                    </div>
                  ) : (
                    <ProductList 
                      products={products} 
                      onProductDeleted={handleProductDeleted}
                      onProductUpdated={handleProductUpdated}
                    />
                  )}
                </>
              ) : (
                <FeaturedCollection />
              )}
            </AnimatedSection>
          </div>
        </main>
      </div>
    </AdminProtected>
  );
}
