import { updateOrderStatus } from '../../../utils/supabaseDb';
import { withAuth } from '../../../middleware/auth';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }
  
  try {
    // Obtener datos del cuerpo
    const { orderId, rejectionReason } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden no proporcionado' 
      });
    }
    
    if (!rejectionReason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Motivo de rechazo no proporcionado' 
      });
    }

    // Actualizar el estado de la orden a rechazada
    const updatedOrder = await updateOrderStatus(orderId, 'cancelled', 'rejected');
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    console.log(`❌ Pago rechazado para orden ${orderId} por admin ${req.user.email}. Motivo: ${rejectionReason}`);
    
    return res.status(200).json({
      success: true,
      message: 'Pago rechazado exitosamente',
      order: updatedOrder,
      rejectionReason
    });
    
  } catch (error) {
    console.error('Error al rechazar pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}

// Exportar con protección de administrador y validación
export default withAuth(handler, { 
  requireAdmin: true,
  rateLimit: { windowMs: 60000, maxRequests: 20 },
  validation: {
    orderId: { required: true, type: 'uuid' },
    rejectionReason: { required: true, type: 'string', minLength: 5, maxLength: 500 }
  }
})