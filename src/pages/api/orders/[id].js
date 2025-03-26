import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { query } from '../../../utils/dbServer';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Verificar que el ID existe
  if (!id) {
    return res.status(400).json({ success: false, message: 'ID de orden no proporcionado' });
  }
  
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }
  
  // Obtener el email del usuario de la sesión
  const userEmail = session.user.email;
  
  try {
    // Obtener el ID del usuario
    const userResult = await query('SELECT id FROM users WHERE email = ?', [userEmail]);
    
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    const userId = userResult[0].id;
    
    // Si es una solicitud GET, obtener detalles de la orden
    if (req.method === 'GET') {
      // Obtener la orden y verificar que pertenezca al usuario
      const orderResult = await query(
        `SELECT o.*, ua.name, ua.email, ua.address, ua.city, ua.state, ua.postal_code, ua.phone
         FROM orders o
         JOIN user_addresses ua ON o.address_id = ua.id
         WHERE o.id = ? AND o.user_id = ?`,
        [id, userId]
      );
      
      if (!orderResult || orderResult.length === 0) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }
      
      const order = orderResult[0];
      
      // Obtener los items de la orden
      const orderItemsResult = await query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [id]
      );
      
      // Verificar si hay un recibo de pago
      const receiptResult = await query(
        'SELECT * FROM payment_receipts WHERE order_id = ?',
        [id]
      );
      
      const receipt = receiptResult.length > 0 ? receiptResult[0] : null;
      
      // Construir la respuesta
      return res.status(200).json({
        success: true,
        order: {
          ...order,
          items: orderItemsResult,
          receipt
        }
      });
    }
    
    // Si es una solicitud PUT, actualizar el estado de la orden
    if (req.method === 'PUT') {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ success: false, message: 'Estado no proporcionado' });
      }
      
      // Verificar que la orden pertenece al usuario
      const orderCheck = await query(
        'SELECT id FROM orders WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (!orderCheck || orderCheck.length === 0) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }
      
      // Actualizar el estado de la orden
      await query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
      
      return res.status(200).json({
        success: true,
        message: 'Estado de la orden actualizado correctamente'
      });
    }
    
    return res.status(405).json({ success: false, message: 'Método no permitido' });
    
  } catch (error) {
    console.error('Error al procesar la orden:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud'
    });
  }
} 