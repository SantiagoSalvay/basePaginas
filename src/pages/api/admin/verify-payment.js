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
    const { orderId, verificationNote } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'ID de orden no proporcionado' });
    }
    
    // Iniciar transacción
    await query('START TRANSACTION');
    
    try {
      // Actualizar el estado del recibo de pago
      await query(
        `UPDATE payment_receipts 
         SET verification_status = 'verified', 
             admin_notes = ?,
             verification_date = NOW()
         WHERE order_id = ?`,
        [verificationNote, orderId]
      );
      
      // Actualizar el estado de pago y de la orden
      await query(
        `UPDATE orders 
         SET payment_status = 'completed', 
             status = 'processing',
             notes = CONCAT(IFNULL(notes, ''), ?)
         WHERE id = ?`,
        ['\n' + (verificationNote ? `Pago verificado: ${verificationNote}` : 'Pago verificado'), orderId]
      );
      
      // Confirmar la transacción
      await query('COMMIT');
      
      // Enviar correo electrónico de confirmación (en una implementación real)
      // await sendPaymentConfirmationEmail(orderId);
      
      return res.status(200).json({
        success: true,
        message: 'Pago verificado correctamente'
      });
      
    } catch (error) {
      // Revertir en caso de error
      await query('ROLLBACK');
      console.error('Error al verificar el pago:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Error al verificar el pago'
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