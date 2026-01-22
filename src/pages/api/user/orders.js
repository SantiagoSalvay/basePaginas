import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserOrders, getUserByEmail } from '../../../utils/supabaseDb';
import { withAuth } from '../../../middleware/auth';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }
  
  try {
    const userEmail = req.user.email;
    
    // Obtener órdenes del usuario usando Supabase
    const orders = await getUserOrders(req.user.id);
    
    return res.status(200).json({
      success: true,
      orders: orders || []
    });
    
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Exportar con protección de autenticación
export default withAuth(handler, { 
  requireAdmin: false, // Solo requiere estar autenticado
  rateLimit: { windowMs: 60000, maxRequests: 60 }
})