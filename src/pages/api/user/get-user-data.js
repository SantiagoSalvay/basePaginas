import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserByEmail } from '../../../utils/supabaseDb';
import { withAuth } from '../../../middleware/auth';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // El usuario ya está disponible en req.user gracias al middleware
    const userData = req.user;
    
    // Remover información sensible
    const { password, ...safeUserData } = userData;
    
    return res.status(200).json({
      success: true,
      user: safeUserData
    });
    
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
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