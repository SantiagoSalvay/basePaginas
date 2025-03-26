import { getSession } from 'next-auth/react';
import { query } from '../../../utils/dbServer';

export default async function handler(req, res) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar la sesión del usuario
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Asegurarnos de que tenemos un ID de usuario válido
    // En NextAuth, el email a menudo está disponible incluso si el ID personalizado no lo está
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'No se pudo identificar al usuario' 
      });
    }
    
    // Primero, obtener el ID del usuario desde el email
    const userResult = await query(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    );
    
    if (!userResult || userResult.length === 0) {
      return res.status(200).json({ 
        success: true, 
        addresses: [] 
      });
    }
    
    const userId = userResult[0].id;

    // Obtener direcciones del usuario
    const addresses = await query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    return res.status(200).json({ 
      success: true, 
      addresses
    });
    
  } catch (error) {
    console.error('Error al obtener direcciones:', error);
    return res.status(500).json({ message: 'Error al obtener direcciones' });
  }
} 