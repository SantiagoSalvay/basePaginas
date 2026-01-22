import { updateOrderStatus, getOrderById } from '../../../utils/supabaseDb';
import { withAuth } from '../../../middleware/auth';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    // Obtener datos del cuerpo
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden o estado no proporcionado' 
      });
    }

    // Validar que el estado sea válido
    const validStatuses = ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }
    
    // Obtener información de la orden para verificar que existe
    const orderData = await getOrderById(orderId);
    
    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Actualizar el estado de la orden
    const updatedOrder = await updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado de la orden'
      });
    }

    console.log(`📦 Estado de orden ${orderId} actualizado a "${status}" por admin ${req.user.email}`);

    // TODO: Aquí se podría enviar email de notificación al usuario
    // if (orderData.users?.email) {
    //   await sendOrderStatusEmail(orderData.users.email, orderData.users.name, status, orderId);
    // }
    
    return res.status(200).json({
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      order: updatedOrder,
      previousStatus: orderData.status,
      newStatus: status
    });
    
  } catch (error) {
    console.error('Error al actualizar estado de orden:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}

// Exportar con protección de administrador y validación estricta
export default withAuth(handler, { 
  requireAdmin: true,
  rateLimit: { windowMs: 60000, maxRequests: 50 },
  validation: {
    orderId: { required: true, type: 'uuid' },
    status: { 
      required: true, 
      type: 'string',
      pattern: /^(pending|processing|shipped|in_transit|delivered|completed|cancelled)$/
    }
  }
})