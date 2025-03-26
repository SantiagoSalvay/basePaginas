import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import PaymentReceiptUploader from '../../components/PaymentReceiptUploader';
import CustomNavbar from '../../components/CustomNavbar';
import Head from 'next/head';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function UploadReceiptPage() {
  const router = useRouter();
  const { orderId, method } = router.query;
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { clearCart } = useCart();
  
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      if (orderId) {
        try {
          console.log('Intentando obtener datos de la orden:', orderId);
          // Obtener los datos de la orden para mostrarlos
          const response = await axios.get(`/api/orders/${orderId}`);
          console.log('Respuesta de la orden:', response.data);
          if (response.data.success) {
            setOrderData(response.data.order);
          } else {
            toast.error('No se pudo cargar la información de la orden');
            router.push('/user/dashboard');
          }
        } catch (error) {
          console.error('Error al cargar la orden:', error);
          toast.error('Error al cargar la información de tu orden');
          router.push('/user/dashboard');
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkSession();
  }, [orderId, router]);
  
  useEffect(() => {
    if (uploadSuccess) {
      console.log('Estado uploadSuccess activado, configurando redirección...');
      // Limpiar los productos del carrito
      console.log('Limpiando el carrito...');
      clearCart();
      
      // Forzar la redirección después de 5 segundos
      const redirectNow = () => {
        console.log('Ejecutando redirección forzada');
        window.location.replace('/user/dashboard?view=orders');
      };
      
      const timer = setTimeout(redirectNow, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess, clearCart]);
  
  const handleUploadSuccess = () => {
    console.log('Comprobante subido correctamente, actualizando estado...');
    setUploadSuccess(true);
    toast.success('Comprobante subido correctamente. Serás redirigido a tu dashboard en 5 segundos');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950">
      <Head>
        <title>Subir Comprobante de Pago | Tienda</title>
      </Head>
      
      {/* Navbar sin opciones de navegación */}
      <CustomNavbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <Link href="/user/dashboard?view=cart">
            <button className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
              <FiArrowLeft className="mr-2" /> Volver al carrito
            </button>
          </Link>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : uploadSuccess ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md"
            >
              <div className="text-green-500 dark:text-green-400 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">¡Comprobante Recibido!</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">Tu comprobante ha sido recibido. El administrador verificará tu pago pronto.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Serás redirigido a tu dashboard en 5 segundos...</p>
              <button
                onClick={() => window.location.href = '/user/dashboard?view=orders'}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Ir a mi dashboard ahora
              </button>
            </motion.div>
          ) : orderData ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subir Comprobante de Pago</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Orden #{orderId} - {method === 'mercadopago' ? 'Mercado Pago' : 'PayPal'}
                </p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Resumen de la Orden</h2>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total:</p>
                        <p className="font-semibold text-gray-900 dark:text-white">${parseFloat(orderData.total_amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Estado:</p>
                        <p className="font-semibold">
                          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200">
                            Pendiente de pago
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Instrucciones para {method === 'mercadopago' ? 'Mercado Pago' : 'PayPal'}</h2>
                  
                  {method === 'mercadopago' ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded mb-4">
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>Abre tu aplicación de Mercado Pago</li>
                        <li>Selecciona la opción de transferir</li>
                        <li>Envía el monto total de <strong>${parseFloat(orderData.total_amount).toFixed(2)}</strong> a la siguiente cuenta:</li>
                        <li className="font-semibold">Juan Santiago Salvay Mendez</li>
                        <li className="font-semibold">CVU: 0000003100039373010316</li>
                        <li className="font-semibold">Alias: casa.pc.2</li>
                        <li className="font-semibold">CUIT/CUIL: 20466557251</li>
                        <li>Toma una captura o guarda el comprobante de la transferencia</li>
                        <li>Sube el comprobante a continuación</li>
                      </ol>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded mb-4">
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>Inicia sesión en tu cuenta de PayPal</li>
                        <li>Selecciona la opción de enviar dinero</li>
                        <li>Envía el monto total de <strong>${parseFloat(orderData.total_amount).toFixed(2)}</strong> a la siguiente cuenta:</li>
                        <li className="font-semibold">correo@example.com</li>
                        <li>Toma una captura o guarda el comprobante de la transferencia</li>
                        <li>Sube el comprobante a continuación</li>
                      </ol>
                    </div>
                  )}
                  
                  <PaymentReceiptUploader 
                    orderId={orderId} 
                    paymentMethod={method}
                    onUploadSuccess={handleUploadSuccess}
                    onError={(error) => {
                      console.error('Error en la subida del comprobante:', error);
                      toast.error('Error al subir el comprobante: ' + (error.message || 'Error desconocido'));
                    }}
                  />
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                  <p>Una vez que subas tu comprobante, nuestro equipo verificará el pago y procesará tu orden.</p>
                  <p>Recibirás una confirmación por correo electrónico cuando tu pago haya sido verificado.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <p className="text-gray-800 dark:text-gray-200 mb-4">No se encontró la información de la orden.</p>
              <button 
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 