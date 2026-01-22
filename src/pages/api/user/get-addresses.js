import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserAddresses } from '../../../utils/supabaseDb';
import { withAuth } from '../../../middleware/auth';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const userId = req.user.id;
    
    // Obtener direcciones del usuario desde Supabase
    const addresses = await getUserAddresses(userId);
    
    return res.status(200).json({
      success: true,
      addresses: addresses || []
    });
    
  } catch (error) {
    console.error('Error al obtener direcciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Exportar con protección de autenticación
export default withAuth(handler, { 
  requireAdmin: false,
  rateLimit: { windowMs: 60000, maxRequests: 100 }
})