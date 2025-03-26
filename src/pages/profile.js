import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession, signOut } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiUser, FiShoppingBag, FiLogOut, FiCheckCircle, FiClock, FiXCircle, FiTruck, FiFileText } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import CartWidget from '../components/CartWidget';

export default function ProfilePage() {
  const router = useRouter();
  const { view } = router.query;
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUserData(session.user);
      
      // Si hay un parámetro view en la URL, activar esa pestaña
      if (view) {
        console.log('Activando pestaña basada en URL:', view);
        setActiveTab(view);
        
        if (view === 'orders') {
          fetchOrders();
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [router, view]);
  
  const fetchOrders = async () => {
    try {
      console.log('Solicitando órdenes al servidor...');
      const response = await axios.get('/api/user/orders');
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        console.log(`Recibidas ${response.data.orders.length} órdenes`);
        setOrders(response.data.orders);
      } else {
        console.error('Error en la respuesta:', response.data.message);
        toast.error('Error al cargar tus órdenes');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      toast.error('Error al cargar tus órdenes');
      setLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'orders' && orders.length === 0) {
      fetchOrders();
    }
    
    // Actualizar la URL para reflejar la pestaña activa
    router.push({
      pathname: '/profile',
      query: tab !== 'profile' ? { view: tab } : {}
    }, undefined, { shallow: true });
  };
  
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };
  
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };
  
  const getOrderStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };
  
  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente de verificación';
      case 'completed': return 'Verificado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };
  
  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-500" />;
      case 'processing': return <FiTruck className="text-blue-500" />;
      case 'completed': return <FiCheckCircle className="text-green-500" />;
      case 'cancelled': return <FiXCircle className="text-red-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };
  
  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-500" />;
      case 'completed': return <FiCheckCircle className="text-green-500" />;
      case 'rejected': return <FiXCircle className="text-red-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };
  
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'card': return 'Tarjeta';
      case 'mercadopago': return 'Mercado Pago';
      case 'paypal': return 'PayPal';
      default: return method;
    }
  };
  
  return (
    <Layout title="Mi Perfil">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              {userData && (
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <FiUser size={36} className="text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold">{userData.name}</h2>
                  <p className="text-gray-600">{userData.email}</p>
                </div>
              )}
              
              <nav>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleTabChange('profile')}
                      className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                        activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FiUser className="mr-3" /> Mi Cuenta
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('orders')}
                      className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                        activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FiShoppingBag className="mr-3" /> Mis Compras
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('cart')}
                      className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                        activeTab === 'cart' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FiShoppingBag className="mr-3" /> Mi Carrito
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 rounded-md flex items-center text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut className="mr-3" /> Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Content */}
          <div className="md:w-3/4">
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : activeTab === 'profile' ? (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
                
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Información Personal</h2>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Nombre</p>
                          <p className="font-medium">{userData?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{userData?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Aquí se pueden agregar más secciones como direcciones guardadas, preferencias, etc. */}
                </div>
              </div>
            ) : activeTab === 'orders' ? (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6">Mis Compras</h1>
                
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Orden
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                              <div className="text-sm text-gray-500">{getPaymentMethodText(order.payment_method)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(order.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                ${order.total_amount.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.items.length} producto(s)
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getOrderStatusIcon(order.status)}
                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                  {getOrderStatusText(order.status)}
                                </span>
                              </div>
                              {(order.payment_method === 'mercadopago' || order.payment_method === 'paypal') && (
                                <div className="flex items-center mt-1">
                                  {getPaymentStatusIcon(order.payment_status)}
                                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                    ${
                                      order.payment_status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                      order.payment_status === 'completed' ? 'bg-green-50 text-green-700' :
                                      'bg-red-50 text-red-700'
                                    }`}>
                                    {getPaymentStatusText(order.payment_status)}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => viewOrderDetails(order)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <FiFileText className="mr-1" /> Ver detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-md">
                    <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay compras</h3>
                    <p className="mt-1 text-sm text-gray-500">Aún no has realizado ninguna compra.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Ir a comprar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'cart' ? (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6">Mi Carrito</h1>
                
                <CartWidget />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Modal de Detalle de Orden */}
      {isOrderModalOpen && selectedOrder && (
        <Modal
          title={`Detalle de la Orden #${selectedOrder.id}`}
          onClose={() => setIsOrderModalOpen(false)}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-500">Fecha de la orden:</p>
                <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center">
                {getOrderStatusIcon(selectedOrder.status)}
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {getOrderStatusText(selectedOrder.status)}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">Detalles de la Compra</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-start border-b border-gray-100 pb-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{item.product_name}</h4>
                        <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="mt-1 flex text-sm">
                        <p className="text-gray-500">Cantidad: {item.quantity}</p>
                        <p className="ml-4 text-gray-500">Precio unitario: ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between py-2">
                  <p className="text-sm font-medium text-gray-900">Total:</p>
                  <p className="text-lg font-semibold text-gray-900">${selectedOrder.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">Método de Pago</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">{getPaymentMethodText(selectedOrder.payment_method)}</p>
                {(selectedOrder.payment_method === 'mercadopago' || selectedOrder.payment_method === 'paypal') && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Estado del pago:</p>
                    <p className={`text-sm font-medium ${
                      selectedOrder.payment_status === 'completed' ? 'text-green-600' :
                      selectedOrder.payment_status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {getPaymentStatusText(selectedOrder.payment_status)}
                    </p>
                    
                    {selectedOrder.receipt && selectedOrder.receipt.verification_status === 'rejected' && (
                      <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        <p className="font-semibold">Motivo de rechazo:</p>
                        <p>{selectedOrder.receipt.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold mb-3">Información de Envío</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">{selectedOrder.name}</p>
                <p className="text-gray-600">{selectedOrder.address}</p>
                <p className="text-gray-600">
                  {selectedOrder.city}, {selectedOrder.state} {selectedOrder.postal_code}
                </p>
                <p className="text-gray-600">{selectedOrder.phone}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
} 