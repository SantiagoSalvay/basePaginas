import { getSession } from 'next-auth/react';
import { query } from '../../../utils/dbServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }
  
  try {
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    
    // Verificar si el usuario es administrador
    const userEmail = session.user.email;
    const userResult = await query(
      'SELECT role FROM users WHERE email = ?',
      [userEmail]
    );
    
    if (!userResult || userResult.length === 0 || userResult[0].role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    
    // Obtener todas las órdenes con información adicional
    const ordersResult = await query(
      `SELECT o.*, 
       ua.name, ua.email, ua.address, ua.city, ua.state, ua.postal_code, ua.phone,
       COUNT(oi.id) as item_count
       FROM orders o 
       JOIN user_addresses ua ON o.address_id = ua.id 
       JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    
    // Para cada orden, obtener los ítems
    for (let i = 0; i < ordersResult.length; i++) {
      const order = ordersResult[i];
      
      // Obtener los items de la orden
      const itemsResult = await query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      
      order.items = itemsResult;
      
      // Verificar si hay recibo de pago
      const receiptResult = await query(
        'SELECT * FROM payment_receipts WHERE order_id = ?',
        [order.id]
      );
      
      order.receipt = receiptResult.length > 0 ? receiptResult[0] : null;
    }
    
    return res.status(200).json({
      success: true,
      orders: ordersResult
    });
    
  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las órdenes'
    });
  }
} 