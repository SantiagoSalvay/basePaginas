import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiCheck, FiX, FiEye, FiImage, FiDownload, FiFilter, FiTruck, FiPackage, FiBarChart } from 'react-icons/fi';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';

export default function AdminOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const checkAdminSession = async () => {
      const session = await getSession();
      if (!session || session.user.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      
      fetchOrders();
    };
    
    checkAdminSession();
  }, []);
  
  useEffect(() => {
    if (orders.length > 0) {
      filterOrders(filter);
    }
  }, [orders, filter]);
  
  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/admin/orders');
      setOrders(response.data.orders);
      setFilteredOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      toast.error('Error al cargar las órdenes');
      setLoading(false);
    }
  };
  
  const filterOrders = (filterType) => {
    switch (filterType) {
      case 'mercadopago':
        setFilteredOrders(orders.filter(order => order.payment_method === 'mercadopago'));
        break;
      case 'paypal':
        setFilteredOrders(orders.filter(order => order.payment_method === 'paypal'));
        break;
      case 'card':
        setFilteredOrders(orders.filter(order => order.payment_method === 'card'));
        break;
      case 'pending':
        setFilteredOrders(orders.filter(order => order.status === 'pending'));
        break;
      case 'processing':
        setFilteredOrders(orders.filter(order => order.status === 'processing'));
        break;
      case 'shipped':
        setFilteredOrders(orders.filter(order => order.status === 'shipped'));
        break;
      case 'in_transit':
        setFilteredOrders(orders.filter(order => order.status === 'in_transit'));
        break;
      case 'delivered':
        setFilteredOrders(orders.filter(order => order.status === 'delivered'));
        break;
      case 'completed':
        setFilteredOrders(orders.filter(order => order.status === 'completed'));
        break;
      case 'cancelled':
        setFilteredOrders(orders.filter(order => order.status === 'cancelled'));
        break;
      case 'pending_payment':
        setFilteredOrders(orders.filter(order => order.payment_status === 'pending'));
        break;
      case 'verified_payment':
        setFilteredOrders(orders.filter(order => order.payment_status === 'completed'));
        break;
      default:
        setFilteredOrders(orders);
    }
  };
  
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };
  
  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };
  
  const verifyPayment = async (orderId) => {
    try {
      const response = await axios.post('/api/admin/verify-payment', {
        orderId,
        verificationNote: verificationNote || 'Pago verificado por administrador'
      });
      
      if (response.data.success) {
        toast.success('Pago verificado correctamente');
        setIsReceiptModalOpen(false);
        setIsViewModalOpen(false);
        fetchOrders(); // Recargar órdenes
      } else {
        toast.error(response.data.message || 'Error al verificar el pago');
      }
    } catch (error) {
      console.error('Error al verificar pago:', error);
      toast.error('Error al verificar el pago');
    }
  };
  
  const rejectPayment = async (orderId) => {
    if (!verificationNote) {
      toast.error('Por favor, proporciona un motivo para el rechazo');
      return;
    }
    
    try {
      const response = await axios.post('/api/admin/reject-payment', {
        orderId,
        rejectionReason: verificationNote
      });
      
      if (response.data.success) {
        toast.success('Pago rechazado');
        setIsReceiptModalOpen(false);
        setIsViewModalOpen(false);
        fetchOrders(); // Recargar órdenes
      } else {
        toast.error(response.data.message || 'Error al rechazar el pago');
      }
    } catch (error) {
      console.error('Error al rechazar pago:', error);
      toast.error('Error al rechazar el pago');
    }
  };
  
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.post('/api/admin/update-order-status', {
        orderId,
        status,
        statusNote
      });
      
      if (response.data.success) {
        toast.success(`Estado actualizado a ${getOrderStatusText(status)}`);
        setIsStatusModalOpen(false);
        
        // Si el modal de detalles está abierto, actualizar la orden seleccionada
        if (isViewModalOpen && selectedOrder) {
          setSelectedOrder({
            ...selectedOrder,
            status
          });
        }
        
        fetchOrders(); // Recargar órdenes
      } else {
        toast.error(response.data.message || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado de la orden');
    }
  };
  
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setIsStatusModalOpen(true);
  };
  
  const getOrderStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
      case 'in_transit': return 'En camino';
      case 'delivered': return 'Entregado';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };
  
  return (
    <Layout title="Administración de Órdenes">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Administración de Órdenes</h1>
        
        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setFilter('all')}
          >
            <FiFilter className="mr-1" /> Todas
          </button>
          
          {/* Filtros de método de pago */}
          <div className="flex flex-wrap gap-2 border-l pl-2 ml-2 border-gray-300">
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'mercadopago' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('mercadopago')}
            >
              <FiFilter className="mr-1" /> Mercado Pago
            </button>
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'paypal' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('paypal')}
            >
              <FiFilter className="mr-1" /> PayPal
            </button>
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('card')}
            >
              <FiFilter className="mr-1" /> Tarjeta
            </button>
          </div>
          
          {/* Filtros de estado de pago */}
          <div className="flex flex-wrap gap-2 border-l pl-2 ml-2 border-gray-300">
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'pending_payment' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('pending_payment')}
            >
              <FiFilter className="mr-1" /> Pago Pendiente
            </button>
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'verified_payment' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('verified_payment')}
            >
              <FiFilter className="mr-1" /> Pago Verificado
            </button>
          </div>
          
          {/* Filtros de estado de orden */}
          <div className="flex flex-wrap gap-2 border-l pl-2 ml-2 border-gray-300">
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('pending')}
            >
              <FiFilter className="mr-1" /> Pendientes
            </button>
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'processing' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('processing')}
            >
              <FiFilter className="mr-1" /> Procesando
            </button>
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'shipped' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('shipped')}
            >
              <FiFilter className="mr-1" /> Enviado
            </button>
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'in_transit' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('in_transit')}
            >
              <FiFilter className="mr-1" /> En camino
            </button>
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'delivered' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('delivered')}
            >
              <FiFilter className="mr-1" /> Entregado
            </button>
            <button 
              className={`px-3 py-2 rounded-md flex items-center text-sm ${filter === 'cancelled' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('cancelled')}
            >
              <FiFilter className="mr-1" /> Cancelado
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Orden ID</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm">{order.id}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium">{order.name}</div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {order.payment_method === 'mercadopago' ? 'Mercado Pago' : 
                       order.payment_method === 'paypal' ? 'PayPal' : 'Tarjeta'}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      ${order.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'in_transit' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.payment_status === 'pending' ? 'Pendiente' :
                         order.payment_status === 'completed' ? 'Verificado' :
                         order.payment_status === 'rejected' ? 'Rechazado' : order.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewOrder(order)} 
                          className="text-blue-500 hover:text-blue-700"
                          title="Ver detalles"
                        >
                          <FiEye size={18} />
                        </button>
                        {order.receipt && (
                          <button 
                            onClick={() => handleViewReceipt(order.receipt)} 
                            className="text-green-500 hover:text-green-700"
                            title="Ver comprobante"
                          >
                            <FiImage size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => openStatusModal(order)} 
                          className="text-purple-500 hover:text-purple-700"
                          title="Cambiar estado"
                        >
                          <FiTruck size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No hay órdenes que coincidan con el filtro seleccionado</p>
          </div>
        )}
      </div>
      
      {/* Modal de Detalles de Orden */}
      {isViewModalOpen && selectedOrder && (
        <Modal title="Detalles de la Orden" onClose={() => setIsViewModalOpen(false)}>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">ID de Orden:</p>
                <p className="font-medium">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha:</p>
                <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado:</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 text-xs rounded ${
                    selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                    selectedOrder.status === 'in_transit' ? 'bg-purple-100 text-purple-800' :
                    selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getOrderStatusText(selectedOrder.status)}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado de Pago:</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 text-xs rounded ${
                    selectedOrder.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOrder.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedOrder.payment_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOrder.payment_status === 'pending' ? 'Pendiente' :
                     selectedOrder.payment_status === 'completed' ? 'Verificado' :
                     selectedOrder.payment_status === 'rejected' ? 'Rechazado' : selectedOrder.payment_status}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-lg font-medium mb-2">Información del Cliente</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre:</p>
                  <p className="font-medium">{selectedOrder.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email:</p>
                  <p className="font-medium">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono:</p>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dirección:</p>
                  <p className="font-medium">{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} {selectedOrder.postal_code}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-lg font-medium mb-2">Productos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded object-cover" src={item.image} alt={item.product_name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          ${item.price ? parseFloat(item.price).toFixed(2) : '0.00'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          ${item.price ? (parseFloat(item.price) * item.quantity).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-4 py-2 text-right text-sm font-medium">Total:</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-bold">
                        ${selectedOrder.total_amount ? parseFloat(selectedOrder.total_amount).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-lg font-medium mb-2">Información de Pago</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Método de Pago:</p>
                  <p className="font-medium">
                    {selectedOrder.payment_method === 'mercadopago' ? 'Mercado Pago' : 
                     selectedOrder.payment_method === 'paypal' ? 'PayPal' : 'Tarjeta'}
                  </p>
                </div>
                {selectedOrder.receipt && (
                  <div>
                    <p className="text-sm text-gray-500">Comprobante:</p>
                    <button 
                      onClick={() => handleViewReceipt(selectedOrder.receipt)}
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <FiImage className="mr-1" /> Ver comprobante
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cerrar
              </button>
              
              <button
                onClick={() => openStatusModal(selectedOrder)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
              >
                <FiTruck className="mr-1" /> Actualizar Estado
              </button>
              
              {selectedOrder.payment_status === 'pending' && selectedOrder.receipt && (
                <>
                  <button
                    onClick={() => verifyPayment(selectedOrder.id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Aprobar Pago
                  </button>
                  <button
                    onClick={() => setVerificationNote('') || setIsReceiptModalOpen(true)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Rechazar Pago
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
      
      {/* Modal de Comprobante de Pago */}
      {isReceiptModalOpen && selectedReceipt && (
        <Modal title="Comprobante de Pago" onClose={() => setIsReceiptModalOpen(false)}>
          <div className="p-4">
            <div className="mb-4">
              <img 
                src={selectedReceipt.receipt_image} 
                alt="Comprobante de pago" 
                className="w-full max-h-96 object-contain rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Fecha de Subida:</p>
                <p className="font-medium">{new Date(selectedReceipt.upload_date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado:</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 text-xs rounded ${
                    selectedReceipt.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedReceipt.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                    selectedReceipt.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedReceipt.verification_status === 'pending' ? 'Pendiente' :
                     selectedReceipt.verification_status === 'verified' ? 'Verificado' :
                     selectedReceipt.verification_status === 'rejected' ? 'Rechazado' : selectedReceipt.verification_status}
                  </span>
                </p>
              </div>
            </div>
            
            {selectedReceipt.verification_status === 'pending' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas de Verificación:
                </label>
                <textarea
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Ingresa notas sobre la verificación o razón de rechazo..."
                ></textarea>
              </div>
            )}
            
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cerrar
              </button>
              
              {selectedReceipt.verification_status === 'pending' && (
                <>
                  <button
                    onClick={() => verifyPayment(selectedReceipt.order_id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex items-center"
                  >
                    <FiCheck className="mr-1" /> Aprobar Pago
                  </button>
                  <button
                    onClick={() => rejectPayment(selectedReceipt.order_id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 flex items-center"
                  >
                    <FiX className="mr-1" /> Rechazar Pago
                  </button>
                </>
              )}
              
              <a 
                href={selectedReceipt.receipt_image} 
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
              >
                <FiDownload className="mr-1" /> Descargar
              </a>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Modal de Estado de Orden */}
      {isStatusModalOpen && selectedOrder && (
        <Modal title="Actualizar Estado de la Orden" onClose={() => setIsStatusModalOpen(false)}>
          <div className="p-4">
            <div className="mb-4">
              <p><strong>Orden ID:</strong> {selectedOrder.id}</p>
              <p><strong>Cliente:</strong> {selectedOrder.name}</p>
              <p><strong>Estado actual:</strong> {getOrderStatusText(selectedOrder.status)}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nuevo Estado:
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="in_transit">En camino</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional):
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Ingresa notas sobre el cambio de estado..."
              ></textarea>
            </div>
            
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => updateOrderStatus(selectedOrder.id, newStatus)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Actualizar Estado
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
} 