import { useState, useEffect } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FiPlus, FiList, FiRefreshCw, FiUsers, FiShoppingBag, FiDollarSign, FiStar, FiPercent } from "react-icons/fi";

// Componentes
import AdminNavbar from "../../components/AdminNavbar";
import AdminProtected from "../../components/AdminProtected";
import ProductForm from "../../components/ProductForm";
import ProductList from "../../components/ProductList";
import AnimatedSection from "../../components/AnimatedSection";
import FeaturedCollection from "../../components/FeaturedCollection";
import DiscountManager from "../../components/DiscountManager";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("add");
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    categories: 0,
    averagePrice: 0
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        
        if (!res.ok) {
          throw new Error("Error al cargar los productos");
        }
        
        const data = await res.json();
        setProducts(data);
        setLoading(false);
        
        // Actualizar estadísticas
        updateStats(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Cargar órdenes cuando se activa la pestaña de ventas
  useEffect(() => {
    if (activeTab === "sales") {
      fetchOrders();
    }
  }, [activeTab]);

  // Función para obtener las órdenes de la base de datos
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch("/api/admin/orders");
      
      if (!res.ok) {
        throw new Error("Error al cargar las órdenes");
      }
      
      const data = await res.json();
      setOrders(data.orders || []);
      setOrdersLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setOrdersLoading(false);
    }
  };

  // Manejar la adición de un nuevo producto
  const handleProductAdded = (newProduct) => {
    setProducts(prevProducts => {
      const category = newProduct.category;
      const updatedProducts = { ...prevProducts };
      
      if (!updatedProducts[category]) {
        updatedProducts[category] = [];
      }
      
      updatedProducts[category] = [...updatedProducts[category], newProduct];
      
      // Actualizar estadísticas
      updateStats(updatedProducts);
      
      return updatedProducts;
    });
    
    // Cambiar a la pestaña de lista para ver el nuevo producto
    setActiveTab("list");
  };
  
  // Manejar la eliminación de un producto
  const handleProductDeleted = (productId) => {
    setProducts(prevProducts => {
      const updatedProducts = { ...prevProducts };
      
      // Buscar y eliminar el producto en todas las categorías
      Object.keys(updatedProducts).forEach(category => {
        updatedProducts[category] = updatedProducts[category].filter(
          product => product.id !== productId
        );
      });
      
      // Eliminar categorías vacías
      Object.keys(updatedProducts).forEach(category => {
        if (updatedProducts[category].length === 0) {
          delete updatedProducts[category];
        }
      });
      
      // Actualizar estadísticas
      updateStats(updatedProducts);
      
      return updatedProducts;
    });
  };
  
  // Manejar la actualización de un producto
  const handleProductUpdated = (updatedProduct) => {
    setProducts(prevProducts => {
      const updatedProducts = { ...prevProducts };
      let found = false;
      
      // Buscar el producto en todas las categorías
      Object.keys(updatedProducts).forEach(category => {
        const index = updatedProducts[category].findIndex(
          product => product.id === updatedProduct.id
        );
        
        if (index !== -1) {
          // Si la categoría cambió
          if (category !== updatedProduct.category) {
            // Eliminar de la categoría actual
            updatedProducts[category].splice(index, 1);
            
            // Añadir a la nueva categoría
            if (!updatedProducts[updatedProduct.category]) {
              updatedProducts[updatedProduct.category] = [];
            }
            updatedProducts[updatedProduct.category].push(updatedProduct);
          } else {
            // Actualizar en la misma categoría
            updatedProducts[category][index] = updatedProduct;
          }
          
          found = true;
        }
      });
      
      // Si no se encontró (caso raro pero posible)
      if (!found) {
        if (!updatedProducts[updatedProduct.category]) {
          updatedProducts[updatedProduct.category] = [];
        }
        updatedProducts[updatedProduct.category].push(updatedProduct);
      }
      
      // Eliminar categorías vacías
      Object.keys(updatedProducts).forEach(category => {
        if (updatedProducts[category].length === 0) {
          delete updatedProducts[category];
        }
      });
      
      // Actualizar estadísticas
      updateStats(updatedProducts);
      
      return updatedProducts;
    });
  };

  // Actualizar estadísticas basadas en los productos actuales
  const updateStats = (productsData) => {
    const allProducts = Object.values(productsData).flat();
    const totalProducts = allProducts.length;
    const categories = Object.keys(productsData).length;
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

        <AdminNavbar />

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

            {/* Accesos Rápidos - Principal (fila superior con 3 botones) */}
            <AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button 
                  onClick={() => setActiveTab("add")} 
                  className="bg-gray-900 dark:bg-gray-800 rounded-lg p-6 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 text-left"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center text-white mr-4">
                      <FiPlus size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Añadir Producto</h3>
                      <p className="text-sm text-gray-400">Crear un nuevo producto</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab("list")} 
                  className="bg-gray-900 dark:bg-gray-800 rounded-lg p-6 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 text-left"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-green-600 dark:bg-green-700 flex items-center justify-center text-white mr-4">
                      <FiList size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Gestionar Productos</h3>
                      <p className="text-sm text-gray-400">Editar o eliminar productos</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab("featured")} 
                  className="bg-gray-900 dark:bg-gray-800 rounded-lg p-6 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 text-left"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-600 dark:bg-amber-700 flex items-center justify-center text-white mr-4">
                      <FiStar size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Colección Destacada</h3>
                      <p className="text-sm text-gray-400">Gestionar productos destacados</p>
                    </div>
                  </div>
                </button>
              </div>
            </AnimatedSection>

            {/* Accesos Rápidos - Secundario (fila inferior con 3 botones rectangulares) */}
            <AnimatedSection delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <button
                  onClick={() => setActiveTab("offers")}
                  className="bg-gray-900 dark:bg-gray-800 rounded-lg p-6 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 text-left"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-pink-600 dark:bg-pink-700 flex items-center justify-center text-white mr-4">
                      <FiPercent size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Descuentos</h3>
                      <p className="text-sm text-gray-400">Gestionar ofertas y descuentos</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab("sales")}
                  className="bg-gray-900 dark:bg-gray-800 rounded-lg p-6 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 text-left"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-600 dark:bg-purple-700 flex items-center justify-center text-white mr-4">
                      <FiShoppingBag size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Ventas</h3>
                      <p className="text-sm text-gray-400">Administrar órdenes y pagos</p>
                    </div>
                  </div>
                </button>
                
                <a href="/admin/create-admin" className="bg-gray-900 dark:bg-gray-800 rounded-lg p-6 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-teal-600 dark:bg-teal-700 flex items-center justify-center text-white mr-4">
                      <FiUsers size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Administradores</h3>
                      <p className="text-sm text-gray-400">Gestionar accesos al panel</p>
                    </div>
                  </div>
                </a>
              </div>
            </AnimatedSection>

            {/* Contenido de la tab activa */}
            <AnimatedSection delay={0.2}>
              {activeTab === "add" ? (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Añadir Nuevo Producto</h2>
                  <ProductForm onProductAdded={handleProductAdded} />
                </div>
              ) : activeTab === "list" ? (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Gestionar Productos</h2>
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
                </div>
              ) : activeTab === "featured" ? (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Colección Destacada</h2>
                  <FeaturedCollection />
                </div>
              ) : activeTab === "offers" ? (
                <div className="mt-8">
                  <DiscountManager />
                </div>
              ) : activeTab === "sales" ? (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Administración de Ventas</h2>
                  
                  {ordersLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Orden ID</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Método</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pago</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="py-4 px-4 text-sm">{order.id}</td>
                              <td className="py-4 px-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{order.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{order.email}</div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                                {order.payment_method === 'mercadopago' ? 'Mercado Pago' : 
                                 order.payment_method === 'paypal' ? 'PayPal' : 'Tarjeta'}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">${order.total_amount?.toFixed(2)}</td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                  order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                  order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                                  order.status === 'in_transit' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {order.status === 'pending' ? 'Pendiente' :
                                   order.status === 'processing' ? 'Procesando' :
                                   order.status === 'shipped' ? 'Enviado' :
                                   order.status === 'in_transit' ? 'En camino' :
                                   order.status === 'delivered' ? 'Entregado' :
                                   order.status === 'completed' ? 'Completado' :
                                   order.status === 'cancelled' ? 'Cancelado' :
                                   order.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                  order.payment_status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  order.payment_status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {order.payment_status === 'pending' ? 'Pendiente' :
                                   order.payment_status === 'completed' ? 'Verificado' :
                                   order.payment_status === 'rejected' ? 'Rechazado' :
                                   order.payment_status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <p className="text-gray-500 dark:text-gray-400">No hay órdenes disponibles</p>
                    </div>
                  )}
                </div>
              ) : null}
            </AnimatedSection>
          </div>
        </main>
      </div>
    </AdminProtected>
  );
}
