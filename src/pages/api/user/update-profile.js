// src/pages/api/user/update-profile.js
import { getUserByEmail, updateUser } from '../../../utils/userDbStore';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { name, email, phone } = req.body;

    // Validaciones básicas
    if (!name || !email) {
      return res.status(400).json({ message: 'El nombre y el email son obligatorios' });
    }

    // Buscar el usuario por email
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar la información del usuario
    const updatedUser = await updateUser(user.id, {
      name,
      phone: phone || '',
    });

    // Responder con éxito
    return res.status(200).json({
      message: 'Información actualizada correctamente',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
