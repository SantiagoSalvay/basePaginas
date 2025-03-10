// src/pages/api/user/change-password.js
import { getUserByEmail, updateUser } from '../../../utils/userStore';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email, currentPassword, newPassword } = req.body;

    // Validaciones básicas
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Buscar el usuario por email
    const user = getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña del usuario
    updateUser(user.id, {
      password: hashedPassword
    });

    // Responder con éxito
    return res.status(200).json({ 
      message: 'Contraseña actualizada correctamente'
    });
    
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
