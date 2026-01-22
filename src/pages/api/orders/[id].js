import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getOrderById } from '../../../utils/supabaseDb';
import { withAuth } from '../../../middleware/auth';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden no proporcionado'
      });
    }

    // Obtener la orden desde Supabase
    const order = await getOrderById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que el usuario sea el dueño de la orden o sea admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }
    
    return res.status(200).json({
      success: true,
      order
    });
    
  } catch (error) {
    console.error('Error al obtener orden:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Exportar con protección de autenticación
export default withAuth(handler, { 
  requireAdmin: false,
  rateLimit: { windowMs: 60000, maxRequests: 60 }
})