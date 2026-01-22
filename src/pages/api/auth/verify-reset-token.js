import { getUserByResetToken } from '../../../utils/userDbStore';

export default async function handler(req, res) {
  // Solo permitir solicitudes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    // Buscar el usuario por token usando Supabase
    const user = await getUserByResetToken(token);

    if (!user) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    // Verificar si el token ha expirado
    // Supabase usa snake_case para las columnas
    if (user.reset_token_expires) {
      const expiryDate = new Date(user.reset_token_expires);
      const now = new Date();

      if (now > expiryDate) {
        return res.status(400).json({ error: 'Token expirado' });
      }
    }

    // Token válido
    return res.status(200).json({ success: true, email: user.email });
  } catch (error) {
    console.error('Error al verificar token de restablecimiento:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
