import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createOrder, getUserByEmail } from '../../../utils/supabaseDb';
import { withAuth } from '../../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Obtener datos del cuerpo de la solicitud
    const { 
      addressData,
      paymentMethod,
      cartItems,
      totalAmount,
      currency = 'USD',
      transactionId,
      paymentDate
    } = req.body;

    console.log('Datos recibidos:', {
      addressData,
      paymentMethod,
      cartItems: Array.isArray(cartItems) ? `${cartItems.length} items` : typeof cartItems,
      totalAmount,
      currency,
      transactionId,
      paymentDate
    });

    // Validar datos obligatorios
    if (!addressData || !paymentMethod || !cartItems || !totalAmount) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }
    
    // El usuario ya está disponible en req.user gracias al middleware
    const userId = req.user.id;
    console.log('ID del usuario:', userId);
    
    // Preparar datos de la orden
    const orderData = {
      user_id: userId,
      total_amount: parseFloat(totalAmount),
      currency: currency,
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'transfer' ? 'pending' : 'completed',
      shipping_address: addressData,
      items: cartItems,
      discount_applied: 0,
      receipt_image: null
    };

    // Crear la orden usando Supabase
    const newOrder = await createOrder(orderData);
    
    console.log('Orden creada exitosamente:', newOrder.id);
    
    return res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      order: newOrder,
      orderId: newOrder.id
    });
    
  } catch (error) {
    console.error('Error al crear orden:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}

// Exportar con protección de autenticación y validación
export default withAuth(handler, { 
  requireAdmin: false,
  rateLimit: { windowMs: 60000, maxRequests: 10 }, // Más restrictivo para crear órdenes
  validation: {
    addressData: { required: true, type: 'object' },
    paymentMethod: { required: true, type: 'string' },
    cartItems: { required: true, type: 'array' },
    totalAmount: { required: true, type: 'number' }
  }
})