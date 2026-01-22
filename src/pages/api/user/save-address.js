import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createUserAddress } from '../../../utils/supabaseDb';
import { withAuth } from '../../../middleware/auth';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { name, email, address, city, state, postal_code, phone, is_default } = req.body;
    
    // Validar campos requeridos
    if (!name || !email || !address || !city || !state || !postal_code || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Crear nueva dirección usando Supabase
    const newAddress = await createUserAddress({
      user_id: req.user.id,
      name,
      email,
      address,
      city,
      state,
      postal_code,
      phone,
      is_default: is_default || false
    });
    
    return res.status(201).json({
      success: true,
      message: 'Dirección guardada exitosamente',
      address: newAddress
    });
    
  } catch (error) {
    console.error('Error al guardar dirección:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Exportar con protección de autenticación y validación
export default withAuth(handler, { 
  requireAdmin: false,
  rateLimit: { windowMs: 60000, maxRequests: 20 },
  validation: {
    name: { required: true, type: 'string', maxLength: 100 },
    email: { required: true, type: 'email' },
    address: { required: true, type: 'string', maxLength: 255 },
    city: { required: true, type: 'string', maxLength: 100 },
    state: { required: true, type: 'string', maxLength: 100 },
    postal_code: { required: true, type: 'string', maxLength: 20 },
    phone: { required: true, type: 'string', maxLength: 20 }
  }
})