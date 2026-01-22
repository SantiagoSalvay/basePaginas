import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCreditCard, FiShoppingBag } from 'react-icons/fi';
import { FaPaypal, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover, FaCcDinersClub } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatPrice } from '../utils/currencyUtils';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { data: session, status } = useSession();
  const { cartItems, getSubtotal, clearCart } = useCart();
  const { currency, t } = useCurrency();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [cardType, setCardType] = useState('');
  const [cardError, setCardError] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    // Campos para tarjeta
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
  });
  
  // Redireccionar si no hay sesión
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Cargar datos guardados del usuario
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (session?.user) {
        try {
          setLoadingUserData(true);
          // Pre-rellenar con información del usuario autenticado
          setFormData(prevData => ({
            ...prevData,
            name: session.user.name || '',
            email: session.user.email || '',
          }));
          
          // Obtener datos del usuario, incluyendo teléfono
          try {
            const userDataResponse = await axios.get('/api/user/get-user-data');
            if (userDataResponse.data.success && userDataResponse.data.userData) {
              const userData = userDataResponse.data.userData;
              if (userData.phone) {
                setFormData(prevData => ({
                  ...prevData,
                  phone: userData.phone,
                }));
              }
            }
          } catch (userError) {
            console.error('Error cargando datos del usuario:', userError);
          }
          
          // Aquí podrías cargar direcciones guardadas previamente
          const response = await axios.get('/api/user/get-addresses');
          if (response.data.success && response.data.addresses.length > 0) {
            // Usar la dirección predeterminada o la primera
            const defaultAddress = response.data.addresses.find(addr => addr.is_default) || 
                                 response.data.addresses[0];
            
            setFormData(prevData => ({
              ...prevData,
              address: defaultAddress.address,
              city: defaultAddress.city,
              state: defaultAddress.state,
              postalCode: defaultAddress.postal_code,
              phone: defaultAddress.phone || prevData.phone,
            }));
          }
        } catch (error) {
          console.error('Error cargando datos de usuario:', error);
          // No mostrar error, simplemente usar datos de la sesión
        } finally {
          setLoadingUserData(false);
        }
      }
    };

    if (session) {
      loadUserAddresses();
    }
  }, [session]);

  // Función para detectar tipo de tarjeta basado en el número
  const detectCardType = (cardNumber) => {
    const cleanedNumber = cardNumber.replace(/\s+/g, '');
    
    // Visa
    if (/^4/.test(cleanedNumber)) {
      return 'visa';
    }
    
    // Mastercard
    if (/^(5[1-5]|2[2-7])/.test(cleanedNumber)) {
      return 'mastercard';
    }
    
    // American Express
    if (/^3[47]/.test(cleanedNumber)) {
      return 'amex';
    }
    
    // Discover
    if (/^(6011|65|64[4-9]|622)/.test(cleanedNumber)) {
      return 'discover';
    }
    
    // Diners Club
    if (/^(30[0-5]|36|38)/.test(cleanedNumber)) {
      return 'diners';
    }
    
    // Desconocido
    return '';
  };

  // Función para formatear número de tarjeta mientras se escribe
  const formatCardNumber = (value) => {
    const cleanedValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const cardType = detectCardType(cleanedValue);
    
    // Formato según tipo de tarjeta
    if (cardType === 'amex') {
      // American Express: XXXX XXXXXX XXXXX
      const groups = cleanedValue.match(/\d{1,4}/g) || [];
      return groups.join(' ').substring(0, 17);
    } else {
      // Otros: XXXX XXXX XXXX XXXX
      const groups = cleanedValue.match(/\d{1,4}/g) || [];
      return groups.join(' ').substring(0, 19);
    }
  };

  // Función para validar fecha de vencimiento
  const validateExpiry = (value) => {
    if (!value) return 'Fecha requerida';
    
    // Formato MM/AA o MM/AAAA
    const isValidFormat = /^(0[1-9]|1[0-2])\/([0-9]{2}|[0-9]{4})$/.test(value);
    if (!isValidFormat) return 'Formato inválido (MM/AA)';
    
    const [month, year] = value.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Convertir año de 2 dígitos a 4 dígitos
    let fullYear = parseInt(year);
    if (year.length === 2) {
      fullYear = 2000 + parseInt(year);
    }
    
    // Validar que la fecha no sea pasada
    if (fullYear < currentYear || (fullYear === currentYear && parseInt(month) < currentMonth)) {
      return 'La tarjeta ha expirado';
    }
    
    return '';
  };

  // Función para validar CVC
  const validateCVC = (value, cardType) => {
    if (!value) return 'CVC requerido';
    
    const cleanedValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // American Express requiere 4 dígitos, otros 3
    if (cardType === 'amex' && cleanedValue.length !== 4) {
      return 'El CVC para American Express debe tener 4 dígitos';
    } else if (cardType !== 'amex' && cleanedValue.length !== 3) {
      return 'El CVC debe tener 3 dígitos';
    }
    
    return '';
  };

  // Validar tarjeta completa
  const validateCard = () => {
    if (paymentMethod !== 'card') return true;
    
    const errors = {
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvc: '',
    };
    
    // Validar número de tarjeta
    const cleanedNumber = formData.cardNumber.replace(/\s+/g, '');
    if (!cleanedNumber) {
      errors.cardNumber = 'Número de tarjeta requerido';
    } else if (cleanedNumber.length < 15) {
      errors.cardNumber = 'Número de tarjeta incompleto';
    }
    
    // Validar nombre en la tarjeta
    if (!formData.cardName.trim()) {
      errors.cardName = 'Nombre en la tarjeta requerido';
    }
    
    // Validar fecha de expiración
    errors.expiry = validateExpiry(formData.expiry);
    
    // Validar CVC
    errors.cvc = validateCVC(formData.cvc, cardType);
    
    setCardError(errors);
    
    // Retornar verdadero si no hay errores
    return !Object.values(errors).some(error => error !== '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Aplicar formato especial para el número de tarjeta
    if (name === 'cardNumber') {
      const formattedValue = formatCardNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      const newCardType = detectCardType(value);
      setCardType(newCardType);
      return;
    }
    
    // Formato para fecha de expiración
    if (name === 'expiry') {
      let formattedValue = value.replace(/[^\d\/]/g, '');
      if (formattedValue.length === 2 && !formattedValue.includes('/') && formData.expiry.length === 1) {
        formattedValue += '/';
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    // Formato para CVC (solo números)
    if (name === 'cvc') {
      const formattedValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si el método de pago es tarjeta, validar los datos de la tarjeta
    if (paymentMethod === 'card') {
      const isCardValid = validateCard();
      if (!isCardValid) {
        toast.error('Por favor, verifica los datos de tu tarjeta');
        return;
      }
    }
    
    setIsProcessing(true);
    
    try {
      // Validar formulario
      if (!formData.name || !formData.email || !formData.address || 
          !formData.city || !formData.state || !formData.postalCode || 
          !formData.phone || !paymentMethod) {
        toast.error('Por favor, completa todos los campos requeridos');
        setIsProcessing(false);
        return;
      }
      
      // Para MercadoPago o PayPal, creamos la orden, pero la redirección a pago se maneja después
      // de procesar la orden y subir el comprobante
      if (paymentMethod === 'mercadopago' || paymentMethod === 'paypal') {
        try {
          const response = await axios.post('/api/orders/create', {
            addressData: {
              name: formData.name,
              email: formData.email,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              phone: formData.phone,
            },
            paymentMethod,
            cartItems,
            totalAmount: getSubtotal()
          });
          
          console.log('Respuesta de creación de orden:', response.data);
          
          if (response.data.success) {
            // Asegurarse de tener el orderId antes de redirigir
            if (!response.data.orderId) {
              throw new Error('No se recibió el ID de la orden');
            }
            
            setIsProcessing(false);
            // Redirigir a la página de subir comprobante con el ID de la orden
            router.push(`/payment/upload-receipt?orderId=${response.data.orderId}&method=${paymentMethod}`);
            return;
          } else {
            throw new Error(response.data.message || 'No se pudo crear la orden');
          }
        } catch (error) {
          console.error('Error específico en la creación de orden para transferencia:', error);
          toast.error(error.response?.data?.message || error.message || 'Error al crear la orden');
          setIsProcessing(false);
          return;
        }
      }
      
      // Si el pago es con tarjeta, procesar el pago antes de crear la orden
      let paymentResult = { success: true };
      
      if (paymentMethod === 'card') {
        try {
          // Procesar el pago con la API
          const paymentResponse = await axios.post('/api/payment/process-card', {
            cardNumber: formData.cardNumber,
            cardName: formData.cardName,
            expiry: formData.expiry,
            cvc: formData.cvc,
            amount: getSubtotal(),
            cardType: cardType
          });
          
          paymentResult = paymentResponse.data;
          
          if (!paymentResult.success) {
            toast.error(`Error de pago: ${paymentResult.message}`);
            setIsProcessing(false);
            return;
          }
          
          toast.success('Pago procesado correctamente');
          
        } catch (paymentError) {
          console.error('Error procesando el pago:', paymentError);
          
          // Manejar respuestas de error de la API
          if (paymentError.response?.data?.message) {
            toast.error(`Error: ${paymentError.response.data.message}`);
          } else {
            toast.error('Error al procesar el pago. Por favor, intenta con otra tarjeta.');
          }
          
          setIsProcessing(false);
          return;
        }
        
        // Crear la orden para pago con tarjeta
        const response = await axios.post('/api/orders/create', {
          addressData: {
            name: formData.name,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            phone: formData.phone,
          },
          paymentMethod,
          cartItems,
          totalAmount: getSubtotal(),
          // Incluir datos de transacción si es pago con tarjeta
          transactionId: paymentResult.transactionId,
          paymentDate: paymentResult.paymentDate
        });
        
        if (response.data.success) {
          // Para pago con tarjeta, ya procesado
          setTimeout(() => {
            setIsProcessing(false);
            setOrderComplete(true);
            clearCart();
          }, 1000);
        } else {
          throw new Error('No se pudo crear la orden');
        }
      }
    } catch (error) {
      console.error('Error al procesar la orden:', error);
      toast.error('Hubo un error al procesar tu orden. Por favor intenta nuevamente.');
      setIsProcessing(false);
    }
  };

  // Si estamos cargando la sesión, mostrar pantalla de carga
  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Cargando...</h2>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="page-transition">
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950">
          <Head>
            <title>Pedido Completado | Tienda</title>
          </Head>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6 text-green-500">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">¡Gracias por tu compra!</h1>
              <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">Tu pedido ha sido procesado correctamente.</p>
              <Link href="/">
                <button className="hero-button primary-button">Volver a la tienda</button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="page-transition">
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950">
          <Head>
            <title>Checkout | Tienda</title>
          </Head>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6 text-gray-400">
                <FiShoppingBag className="w-20 h-20 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tu carrito está vacío</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Agrega productos a tu carrito antes de proceder al checkout.</p>
              <Link href="/coleccion">
                <button className="hero-button primary-button">Ver productos</button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950">
        <Head>
          <title>Checkout | Tienda</title>
        </Head>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <Link href="/cart">
              <button className="flex items-center text-primary-600 hover:text-primary-700 mb-4">
                <FiArrowLeft className="mr-2" /> Volver al carrito
              </button>
            </Link>
            
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Finalizar Compra</h1>
            
            {loadingUserData ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario de checkout y opciones de pago */}
                <div className="lg:col-span-2">
                  <form onSubmit={handleSubmit}>
                    {/* Información de contacto y envío */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Información de contacto y envío</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo electrónico</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado/Provincia</label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código Postal</label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Métodos de pago */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Método de pago</h2>
                      
                      <div className="space-y-4">
                        {/* Opción 1: Tarjeta de crédito/débito */}
                        <div 
                          className={`border ${paymentMethod === 'card' ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg p-4 cursor-pointer transition-colors`}
                          onClick={() => handlePaymentMethodChange('card')}
                        >
                          <div className="flex items-center">
                            <input 
                              type="radio" 
                              id="card" 
                              name="paymentMethod" 
                              value="card"
                              checked={paymentMethod === 'card'} 
                              onChange={() => handlePaymentMethodChange('card')}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tarjeta de crédito o débito
                            </label>
                            <div className="ml-auto flex space-x-2">
                              <FaCcVisa className="h-8 w-8 text-blue-600" />
                              <FaCcMastercard className="h-8 w-8 text-red-500" />
                              <FaCcAmex className="h-8 w-8 text-blue-400" />
                            </div>
                          </div>
                          
                          {paymentMethod === 'card' && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de tarjeta</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    id="cardNumber"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="0000 0000 0000 0000"
                                    maxLength={19}
                                    className={`w-full pl-10 pr-12 py-2 border ${cardError.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                                  />
                                  <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                  
                                  {/* Mostrar icono según tipo de tarjeta */}
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {cardType === 'visa' && <FaCcVisa className="h-6 w-6 text-blue-600" />}
                                    {cardType === 'mastercard' && <FaCcMastercard className="h-6 w-6 text-red-500" />}
                                    {cardType === 'amex' && <FaCcAmex className="h-6 w-6 text-blue-400" />}
                                    {cardType === 'discover' && <FaCcDiscover className="h-6 w-6 text-orange-500" />}
                                    {cardType === 'diners' && <FaCcDinersClub className="h-6 w-6 text-blue-300" />}
                                  </div>
                                </div>
                                {cardError.cardNumber && (
                                  <p className="mt-1 text-sm text-red-500">{cardError.cardNumber}</p>
                                )}
                              </div>
                              <div className="md:col-span-2">
                                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre en la tarjeta</label>
                                <input
                                  type="text"
                                  id="cardName"
                                  name="cardName"
                                  value={formData.cardName}
                                  onChange={handleInputChange}
                                  className={`w-full px-3 py-2 border ${cardError.cardName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                                />
                                {cardError.cardName && (
                                  <p className="mt-1 text-sm text-red-500">{cardError.cardName}</p>
                                )}
                              </div>
                              <div>
                                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de vencimiento</label>
                                <input
                                  type="text"
                                  id="expiry"
                                  name="expiry"
                                  value={formData.expiry}
                                  onChange={handleInputChange}
                                  placeholder="MM/AA"
                                  maxLength={5}
                                  className={`w-full px-3 py-2 border ${cardError.expiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                                />
                                {cardError.expiry && (
                                  <p className="mt-1 text-sm text-red-500">{cardError.expiry}</p>
                                )}
                              </div>
                              <div>
                                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVC</label>
                                <input
                                  type="text"
                                  id="cvc"
                                  name="cvc"
                                  value={formData.cvc}
                                  onChange={handleInputChange}
                                  placeholder={cardType === 'amex' ? '4 dígitos' : '3 dígitos'}
                                  maxLength={cardType === 'amex' ? 4 : 3}
                                  className={`w-full px-3 py-2 border ${cardError.cvc ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                                />
                                {cardError.cvc && (
                                  <p className="mt-1 text-sm text-red-500">{cardError.cvc}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Opción 2: Mercado Pago */}
                        <div 
                          className={`border ${paymentMethod === 'mercadopago' ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg p-4 cursor-pointer transition-colors`}
                          onClick={() => handlePaymentMethodChange('mercadopago')}
                        >
                          <div className="flex items-center">
                            <input 
                              type="radio" 
                              id="mercadopago" 
                              name="paymentMethod" 
                              value="mercadopago"
                              checked={paymentMethod === 'mercadopago'} 
                              onChange={() => handlePaymentMethodChange('mercadopago')}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label htmlFor="mercadopago" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Transferencia vía Mercado Pago
                            </label>
                            <div className="ml-auto">
                              <div style={{ backgroundColor: "#009ee3", padding: "6px 10px", borderRadius: "4px" }}>
                                <span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>Mercado Pago</span>
                              </div>
                            </div>
                          </div>
                          
                          {paymentMethod === 'mercadopago' && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Al hacer clic en "Completar compra", serás redirigido a Mercado Pago para completar la transacción de forma segura.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Opción 3: PayPal */}
                        <div 
                          className={`border ${paymentMethod === 'paypal' ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg p-4 cursor-pointer transition-colors`}
                          onClick={() => handlePaymentMethodChange('paypal')}
                        >
                          <div className="flex items-center">
                            <input 
                              type="radio" 
                              id="paypal" 
                              name="paymentMethod" 
                              value="paypal"
                              checked={paymentMethod === 'paypal'} 
                              onChange={() => handlePaymentMethodChange('paypal')}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Transferencia vía PayPal
                            </label>
                            <div className="ml-auto">
                              <FaPaypal className="h-8 w-12 text-blue-600" />
                            </div>
                          </div>
                          
                          {paymentMethod === 'paypal' && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Al hacer clic en "Completar compra", serás redirigido a PayPal para completar la transacción de forma segura.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón para completar la compra */}
                    <div className="mt-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={!paymentMethod || isProcessing}
                        className={`w-full hero-button primary-button flex items-center justify-center ${(!paymentMethod || isProcessing) ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isProcessing ? (
                          <>
                            <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Procesando...
                          </>
                        ) : (
                          'Completar compra'
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Resumen del pedido */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Resumen del pedido</h2>
                    
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id + (item.size || '')} className="flex items-start">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                            <img
                              src={item.image || 'https://via.placeholder.com/150'}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-sm text-gray-800 dark:text-gray-200">{item.name}</h3>
                            {item.size && <p className="text-xs text-gray-500 dark:text-gray-400">Talla: {item.size}</p>}
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Cant: {item.quantity}</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatPrice(item.price * item.quantity, currency)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(getSubtotal(), currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Envío</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Calculado en el siguiente paso</span>
                      </div>
                      <div className="flex justify-between items-center font-semibold mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-lg text-primary-600 dark:text-primary-400">
                          {formatPrice(getSubtotal(), currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Checkout;

// Deshabilitar SSG para esta página
export async function getServerSideProps() {
  return {
    props: {}
  };
}
