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
    const { orderId, rejectionReason } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'ID de orden no proporcionado' });
    }
    
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Motivo de rechazo no proporcionado' });
    }
    
    // Iniciar transacción
    await query('START TRANSACTION');
    
    try {
      // Actualizar el estado del recibo de pago
      await query(
        `UPDATE payment_receipts 
         SET verification_status = 'rejected', 
             admin_notes = ?,
             verification_date = NOW()
         WHERE order_id = ?`,
        [rejectionReason, orderId]
      );
      
      // Actualizar el estado de pago y de la orden
      await query(
        `UPDATE orders 
         SET payment_status = 'rejected', 
             notes = CONCAT(IFNULL(notes, ''), ?)
         WHERE id = ?`,
        ['\n' + `Pago rechazado: ${rejectionReason}`, orderId]
      );
      
      // Confirmar la transacción
      await query('COMMIT');
      
      // Enviar correo electrónico de rechazo de pago (en una implementación real)
      // await sendPaymentRejectionEmail(orderId, rejectionReason);
      
      return res.status(200).json({
        success: true,
        message: 'Pago rechazado correctamente'
      });
      
    } catch (error) {
      // Revertir en caso de error
      await query('ROLLBACK');
      console.error('Error al rechazar el pago:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Error al rechazar el pago'
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