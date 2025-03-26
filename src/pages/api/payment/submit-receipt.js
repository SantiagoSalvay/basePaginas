import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { query } from '../../../utils/dbServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Obtener datos del cuerpo de la solicitud
    const { 
      orderId,
      receiptImage,
      paymentMethod
    } = req.body;

    console.log('Datos recibidos:', { orderId, receiptImage, paymentMethod });

    // Validar datos requeridos
    if (!orderId || !receiptImage || !paymentMethod) {
      return res.status(400).json({ 
        success: false,
        message: 'Datos incompletos' 
      });
    }
    
    // Verificar que el usuario es dueño de la orden
    const userEmail = session.user.email;
    
    // Obtener el ID del usuario
    const userResult = await query(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    );
    
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }
    
    const userId = userResult[0].id;
    
    // Verificar si la orden pertenece al usuario y está en estado pendiente
    const orderCheck = await query(
      'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );
    
    if (!orderCheck || orderCheck.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Orden no encontrada o no pertenece al usuario'
      });
    }
    
    if (orderCheck[0].status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'La orden no está en estado pendiente'
      });
    }
    
    // Actualizar la orden con el método de pago
    await query(
      'UPDATE orders SET payment_method = ? WHERE id = ?',
      [paymentMethod, orderId]
    );
    
    // Comprobar si ya existe un comprobante para esta orden
    const existingReceipt = await query(
      'SELECT id FROM payment_receipts WHERE order_id = ?',
      [orderId]
    );
    
    if (existingReceipt && existingReceipt.length > 0) {
      // Actualizar el comprobante existente
      await query(
        'UPDATE payment_receipts SET receipt_image = ?, upload_date = NOW(), verified = FALSE, verified_date = NULL, verified_by = NULL WHERE order_id = ?',
        [receiptImage, orderId]
      );
    } else {
      // Insertar nuevo comprobante
      await query(
        'INSERT INTO payment_receipts (order_id, receipt_image) VALUES (?, ?)',
        [orderId, receiptImage]
      );
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Comprobante guardado correctamente'
    });
    
  } catch (error) {
    console.error('Error al guardar comprobante:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al guardar comprobante'
    });
  }
} 