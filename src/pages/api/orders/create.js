import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { query, beginTransaction, commitTransaction, rollbackTransaction } from '../../../utils/dbServer';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar la sesión del usuario usando getServerSession en lugar de getSession
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Obtener datos del cuerpo de la solicitud
    const { 
      addressData,
      paymentMethod,
      cartItems,
      totalAmount,
      transactionId,
      paymentDate
    } = req.body;

    console.log('Datos recibidos:', {
      addressData,
      paymentMethod,
      cartItems: Array.isArray(cartItems) ? `${cartItems.length} items` : typeof cartItems,
      totalAmount,
      transactionId,
      paymentDate
    });

    // Validar datos obligatorios
    if (!addressData || !paymentMethod || !cartItems || !totalAmount) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }
    
    // Obtener el ID del usuario desde la sesión
    const userEmail = session.user.email;
    console.log('Email del usuario:', userEmail);
    const userResult = await query('SELECT id FROM users WHERE email = ?', [userEmail]);
    
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const userId = userResult[0].id;
    console.log('ID del usuario:', userId);
    
    // Iniciar transacción usando las nuevas funciones
    await beginTransaction();
    
    try {
      // Insertar dirección de envío
      console.log('Insertando dirección de envío...');
      const addressResult = await query(
        'INSERT INTO user_addresses (user_id, name, email, address, city, state, postal_code, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          addressData.name,
          addressData.email,
          addressData.address,
          addressData.city,
          addressData.state,
          addressData.postalCode,
          addressData.phone
        ]
      );
      
      const addressId = addressResult.insertId;
      console.log('Dirección insertada, ID:', addressId);
      
      // Determinar el estado inicial de la orden basado en el método de pago
      let initialStatus = 'pending';
      
      // Si el pago es con tarjeta y tenemos transactionId, el pago ya fue procesado
      if (paymentMethod === 'card' && transactionId) {
        initialStatus = 'processing'; // La orden se procesa inmediatamente después del pago
      }
      
      // Generar un UUID para el ID de la orden
      const orderId = uuidv4();
      console.log('ID de orden generado:', orderId);
      
      // Crear la orden
      console.log('Creando orden...');
      await query(
        'INSERT INTO orders (id, user_id, address_id, status, payment_method, total_amount, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [orderId, userId, addressId, initialStatus, paymentMethod, totalAmount]
      );
      
      console.log('Orden creada, ID:', orderId);
      
      // Insertar items de la orden
      console.log('Insertando items de la orden...');
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        console.log(`Item ${i+1}:`, {
          id: item.id, 
          name: item.name, 
          quantity: item.quantity, 
          price: item.price,
          image: item.image || 'No image'
        });
        
        try {
          // Incluir product_id que es un campo obligatorio
          await query(
            'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
            [orderId, item.id || uuidv4(), item.name || 'Producto', item.quantity || 1, item.price || 0]
          );
        } catch (itemError) {
          console.error(`Error insertando item ${i+1}:`, itemError);
          throw itemError;
        }
      }
      console.log('Items insertados correctamente');
      
      // Si hay transactionId, registrar la transacción
      if (transactionId) {
        await query(
          'INSERT INTO payment_receipts (order_id, transaction_id, payment_date, verification_status) VALUES (?, ?, ?, ?)',
          [orderId, transactionId, paymentDate || new Date(), 'verified']
        );
      }
      
      // Confirmar la transacción
      await commitTransaction();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Orden creada correctamente',
        orderId: orderId
      });
      
    } catch (error) {
      // Revertir en caso de error
      await rollbackTransaction();
      console.error('Error creando la orden:', error);
      return res.status(500).json({ message: 'Error al crear la orden' });
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
} 