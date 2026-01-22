import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getAllOrders } from '../../../utils/supabaseDb';
import { withAuth } from '../../../middleware/auth';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }
  
  try {
    
    // Obtener todas las órdenes usando Supabase
    const ordersResult = await getAllOrders();
    
    return res.status(200).json({
      success: true,
      orders: ordersResult || []
    });
    
  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las órdenes'
    });
  }
}

// Exportar con protección de administrador
export default withAuth(handler, { 
  requireAdmin: true,
  rateLimit: { windowMs: 60000, maxRequests: 30 } // 30 requests per minute
}) 