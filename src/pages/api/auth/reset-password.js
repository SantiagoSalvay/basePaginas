import { getUserByResetToken, updateUser } from '../../../utils/userDbStore';

export default async function handler(req, res) {
  // Solo permitir solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token y contraseña son requeridos' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Buscar el usuario por token usando Supabase
    const user = await getUserByResetToken(token);

    if (!user) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    // Verificar si el token ha expirado
    if (user.reset_token_expires) {
      const expiryDate = new Date(user.reset_token_expires);
      const now = new Date();

      if (now > expiryDate) {
        return res.status(400).json({ error: 'Token expirado' });
      }
    }

    // Actualizar usuario con nueva contraseña y eliminar tokens de restablecimiento
    // userDbStore.updateUser se encargará de hashear la contraseña si no está hasheada
    const updateData = {
      password: password,
      reset_token: null,
      reset_token_expires: null
    };

    const updatedUser = await updateUser(user.id, updateData);

    if (!updatedUser) {
      return res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }

    return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
