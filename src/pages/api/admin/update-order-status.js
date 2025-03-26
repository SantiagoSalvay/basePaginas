import { getSession } from 'next-auth/react';
import { query } from '../../../utils/dbServer';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }
  
  try {
    // Verificar sesión y rol de administrador
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
    
    // Obtener datos del cuerpo
    const { orderId, status, statusNote } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden o estado no proporcionado' 
      });
    }
    
    // Validar que el estado sea válido
    const validStatuses = ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }
    
    // Iniciar transacción
    await query('START TRANSACTION');
    
    try {
      // Actualizar el estado de la orden
      await query(
        `UPDATE orders 
         SET status = ?, 
             notes = CONCAT(IFNULL(notes, ''), ?)
         WHERE id = ?`,
        [status, `\n${new Date().toISOString()} - Estado actualizado a ${status}${statusNote ? ': ' + statusNote : ''}`, orderId]
      );
      
      // Confirmar la transacción
      await query('COMMIT');
      
      // Enviar correo electrónico de actualización (en una implementación real)
      // await sendOrderStatusUpdateEmail(orderId, status);
      
      return res.status(200).json({
        success: true,
        message: 'Estado de la orden actualizado correctamente'
      });
      
    } catch (error) {
      // Revertir en caso de error
      await query('ROLLBACK');
      console.error('Error al actualizar el estado de la orden:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado de la orden'
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
} 