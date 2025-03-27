import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FiPlus, FiList, FiRefreshCw, FiUsers, FiShoppingBag, FiDollarSign, FiStar, FiPercent } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";

// Componentes
import AdminProtected from "../../components/AdminProtected";
import AdminDashboardLayout from "../../components/AdminDashboardLayout";
import ProductForm from "../../components/ProductForm";
import ProductList from "../../components/ProductList";
import AnimatedSection from "../../components/AnimatedSection";
import FeaturedCollection from "../../components/FeaturedCollection";
import DiscountManager from "../../components/DiscountManager";
import Modal from "../../components/Modal";

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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

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
      // Mostrar todas las órdenes sin filtrar por defecto
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

  // Funciones para abrir los diferentes modales
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };
  
  const openReceiptView = (receipt) => {
    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };
  
  const openOrderStatusModal = (order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.status);
    setIsOrderStatusModalOpen(true);
  };

  // Función para actualizar el estado de una orden
  const updateOrderStatus = async () => {
    if (!selectedOrder || !newOrderStatus) return;
    
    try {
      toast.loading('Actualizando estado...');
      
      const response = await fetch("/api/admin/update-order-status", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newOrderStatus
        }),
        credentials: 'include'
      });
      
      toast.dismiss();
      
      const data = await response.json();
      
      if (response.ok) {
        // Actualizar la orden en el estado local
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrder.id 
              ? { ...order, status: newOrderStatus } 
              : order
          )
        );
        
        toast.success(`Estado actualizado a ${getOrderStatusText(newOrderStatus)}`);
        setIsOrderStatusModalOpen(false);
        
        // Volver a cargar las órdenes para asegurar sincronización con BD
        fetchOrders();
      } else {
        toast.error(data.message || "Error al actualizar el estado");
        
        // Si hay error de autenticación, puede ser necesario actualizar la sesión
        if (response.status === 401) {
          toast.error("Sesión expirada. Por favor, inicia sesión de nuevo.");
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error al actualizar estado:", error);
      toast.error("Error de conexión. Intenta de nuevo más tarde.");
    }
  };

  // Función para verificar un comprobante de pago
  const verifyReceipt = async (orderId) => {
    try {
      const response = await axios.post("/api/admin/verify-payment", {
        orderId
      });
      
      if (response.data.success) {
        toast.success("Pago verificado correctamente");
        setIsReceiptModalOpen(false);
        
        // Actualizar órdenes
        fetchOrders();
      } else {
        toast.error(response.data.message || "Error al verificar el pago");
      }
    } catch (error) {
      console.error("Error al verificar pago:", error);
      toast.error("Error al verificar el pago");
    }
  };
  
  // Función para rechazar un comprobante de pago
  const rejectReceipt = async (orderId) => {
    try {
      const response = await axios.post("/api/admin/reject-payment", {
        orderId
      });
      
      if (response.data.success) {
        toast.success("Pago rechazado");
        setIsReceiptModalOpen(false);
        
        // Actualizar órdenes
        fetchOrders();
      } else {
        toast.error(response.data.message || "Error al rechazar el pago");
      }
    } catch (error) {
      console.error("Error al rechazar pago:", error);
      toast.error("Error al rechazar el pago");
    }
  };

  // Función para obtener el texto del estado
  const getOrderStatusText = (status) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "processing": return "Procesando";
      case "shipped": return "Enviado";
      case "in_transit": return "En camino";
      case "delivered": return "Entregado";
      case "completed": return "Finalizado";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  return (
    <AdminProtected>
      <AdminDashboardLayout title="Panel de Administración | ModaVista">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <main className="container mx-auto px-4 pt-20 pb-6">
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
                  
                  {/* Filtros de órdenes */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    <button
                      onClick={fetchOrders}
                      className="px-3 py-1.5 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setOrders(orders.filter(order => order.status === 'pending'))}
                      className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition"
                    >
                      Pendientes
                    </button>
                    <button
                      onClick={() => setOrders(orders.filter(order => order.status === 'processing'))}
                      className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                    >
                      Procesando
                    </button>
                    <button
                      onClick={() => setOrders(orders.filter(order => order.status === 'shipped'))}
                      className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition"
                    >
                      Enviados
                    </button>
                    <button
                      onClick={() => setOrders(orders.filter(order => order.status === 'in_transit'))}
                      className="px-3 py-1.5 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
                    >
                      En Camino
                    </button>
                    <button
                      onClick={() => setOrders(orders.filter(order => order.status === 'delivered' || order.status === 'completed'))}
                      className="px-3 py-1.5 text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                    >
                      Entregados/Completados
                    </button>
                    <button
                      onClick={() => setOrders(orders.filter(order => order.status === 'cancelled'))}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                    >
                      Cancelados
                    </button>
                    
                    <button
                      onClick={fetchOrders}
                      className="px-3 py-1.5 text-sm ml-auto bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center"
                    >
                      <FiRefreshCw className="mr-1" size={14} />
                      Actualizar
                    </button>
                  </div>
                  
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
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
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
                              <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                                ${order.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}
                              </td>
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
                              <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-4 text-sm">
                                <div className="flex space-x-3">
                                  <button 
                                    onClick={() => openOrderDetails(order)}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                    title="Ver detalles"
                                  >
                                    Ver detalles
                                  </button>
                                  {order.receipt && (
                                    <button 
                                      onClick={() => openReceiptView(order.receipt)}
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                      title="Ver comprobante"
                                    >
                                      Ver comprobante
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => openOrderStatusModal(order)}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    title="Cambiar estado"
                                  >
                                    Cambiar estado
                                  </button>
                                </div>
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
          </main>
        </div>

        {/* Modal para ver detalles de la orden */}
        {isOrderDetailsModalOpen && selectedOrder && (
          <Modal
            title={`Detalles de la Orden #${selectedOrder.id}`}
            onClose={() => setIsOrderDetailsModalOpen(false)}
          >
            <div className="p-6 bg-gray-900 text-white rounded-b-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-400">Cliente:</p>
                  <p className="font-medium">{selectedOrder.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{selectedOrder.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Fecha:</p>
                  <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mb-4">
                <h3 className="text-lg font-semibold mb-3">Productos</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Producto</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Precio</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {selectedOrder.items && selectedOrder.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-700">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.product_name || "Producto"} 
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/placeholder-product.png";
                                    }}
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gray-700 text-gray-500">
                                    Sin imagen
                                  </div>
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-white">{item.product_name || "Producto"}</p>
                                {item.size && <p className="text-xs text-gray-400">Talla: {item.size}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-400">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-400">
                            ${item.price ? parseFloat(item.price).toFixed(2) : '0.00'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-white">
                            ${item.price ? (parseFloat(item.price) * item.quantity).toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-800">
                        <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-white">Total:</td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-white">
                          ${selectedOrder.total_amount ? parseFloat(selectedOrder.total_amount).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Estado:</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                      ${
                        selectedOrder.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300' :
                        selectedOrder.status === 'processing' ? 'bg-blue-900/30 text-blue-300' :
                        selectedOrder.status === 'shipped' ? 'bg-indigo-900/30 text-indigo-300' :
                        selectedOrder.status === 'in_transit' ? 'bg-purple-900/30 text-purple-300' :
                        selectedOrder.status === 'delivered' ? 'bg-green-900/30 text-green-300' :
                        selectedOrder.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                        'bg-red-900/30 text-red-300'
                      }`}
                    >
                      {selectedOrder.status === 'pending' ? 'Pendiente' :
                       selectedOrder.status === 'processing' ? 'Procesando' :
                       selectedOrder.status === 'shipped' ? 'Enviado' :
                       selectedOrder.status === 'in_transit' ? 'En camino' :
                       selectedOrder.status === 'delivered' ? 'Entregado' :
                       selectedOrder.status === 'completed' ? 'Completado' :
                       selectedOrder.status === 'cancelled' ? 'Cancelado' :
                       selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Método de pago:</p>
                    <p className="font-medium mt-1">
                      {selectedOrder.payment_method === 'mercadopago' ? 'Mercado Pago' : 
                       selectedOrder.payment_method === 'paypal' ? 'PayPal' : 'Tarjeta'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mb-4">
                <h3 className="text-lg font-semibold mb-3">Información de Envío</h3>
                <p className="text-sm"><strong>Dirección:</strong> {selectedOrder.address}</p>
                <p className="text-sm"><strong>Ciudad:</strong> {selectedOrder.city}</p>
                <p className="text-sm"><strong>Estado/Provincia:</strong> {selectedOrder.state}</p>
                <p className="text-sm"><strong>Código Postal:</strong> {selectedOrder.postal_code}</p>
                <p className="text-sm"><strong>Teléfono:</strong> {selectedOrder.phone}</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsOrderDetailsModalOpen(false)}
                  className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </Modal>
        )}
        
        {/* Modal para ver el comprobante */}
        {isReceiptModalOpen && selectedReceipt && (
          <Modal
            title="Comprobante de Pago"
            onClose={() => setIsReceiptModalOpen(false)}
          >
            <div className="p-6 bg-gray-900 text-white rounded-b-lg">
              <div className="mb-4">
                <img 
                  src={selectedReceipt.receipt_image} 
                  alt="Comprobante de pago" 
                  className="w-full h-auto max-h-96 object-contain rounded-md border border-gray-700"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Fecha de subida:</p>
                  <p className="font-medium">{new Date(selectedReceipt.upload_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Estado:</p>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${selectedReceipt.verified ? 'bg-green-900/30 text-green-300' : 
                      'bg-yellow-900/30 text-yellow-300'}`}
                    >
                      {selectedReceipt.verified ? 'Verificado' : 'Pendiente'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                >
                  Cerrar
                </button>
                <a 
                  href={selectedReceipt.receipt_image} 
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Descargar
                </a>
              </div>
            </div>
          </Modal>
        )}
        
        {/* Modal para cambiar el estado de la orden (simplificado) */}
        {isOrderStatusModalOpen && selectedOrder && (
          <Modal
            title="Cambiar Estado de Orden"
            onClose={() => setIsOrderStatusModalOpen(false)}
          >
            <div className="p-6 bg-gray-900 text-white rounded-b-lg">
              <div className="mb-4">
                <p className="text-lg font-semibold">Orden #{selectedOrder.id}</p>
                <p className="text-sm text-gray-400">Cliente: {selectedOrder.name}</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Estado actual:</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      selectedOrder.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300' :
                      selectedOrder.status === 'processing' ? 'bg-blue-900/30 text-blue-300' :
                      selectedOrder.status === 'shipped' ? 'bg-indigo-900/30 text-indigo-300' :
                      selectedOrder.status === 'in_transit' ? 'bg-purple-900/30 text-purple-300' :
                      selectedOrder.status === 'delivered' ? 'bg-green-900/30 text-green-300' :
                      selectedOrder.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                      'bg-red-900/30 text-red-300'
                    }`}
                  >
                    {selectedOrder.status === 'pending' ? 'Pendiente' :
                     selectedOrder.status === 'processing' ? 'Procesando' :
                     selectedOrder.status === 'shipped' ? 'Enviado' :
                     selectedOrder.status === 'in_transit' ? 'En camino' :
                     selectedOrder.status === 'delivered' ? 'Entregado' :
                     selectedOrder.status === 'completed' ? 'Completado' :
                     selectedOrder.status === 'cancelled' ? 'Cancelado' :
                     selectedOrder.status}
                  </span>
                </div>
                
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Selecciona el nuevo estado:
                </label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white"
                >
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="in_transit">En camino</option>
                  <option value="delivered">Entregado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsOrderStatusModalOpen(false)}
                  className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => updateOrderStatus()}
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Actualizar estado
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AdminDashboardLayout>
    </AdminProtected>
  );
}
