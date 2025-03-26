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

    // Asegurarnos de que tenemos un email de usuario válido
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'No se pudo identificar al usuario' 
      });
    }
    
    // Obtener los datos del usuario
    const userResult = await query(
      'SELECT id, name, email, phone, role FROM users WHERE email = ?',
      [userEmail]
    );
    
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }
    
    // Devolver los datos del usuario (excluyendo datos sensibles como contraseña)
    const userData = userResult[0];

    return res.status(200).json({ 
      success: true, 
      userData
    });
    
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al obtener datos del usuario' 
    });
  }
} 