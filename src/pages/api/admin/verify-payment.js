import { updateOrderStatus } from '../../../utils/supabaseDb';
import { withAuth } from '../../../middleware/auth';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }
  
  try {
    // Obtener datos del cuerpo con validación
    const { orderId, verificationNote } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden no proporcionado' 
      });
    }

    // Actualizar el estado de la orden usando Supabase
    const updatedOrder = await updateOrderStatus(orderId, 'processing', 'verified');
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    console.log(`✅ Pago verificado para orden ${orderId} por admin ${req.user.email}`);
    
    return res.status(200).json({
      success: true,
      message: 'Pago verificado exitosamente',
      order: updatedOrder,
      verificationNote: verificationNote || 'Pago verificado por administrador'
    });
    
  } catch (error) {
    console.error('Error al verificar pago:', error);
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
    verificationNote: { required: false, type: 'string', maxLength: 500 }
  }
})