import { updateUser } from '../../../utils/userDbStore';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    // Actualizar la información del usuario usando el ID de la sesión (Seguridad: IDOR Mitigated)
    const updatedUser = await updateUser(session.user.id, {
      name,
      phone: phone || '',
    });

    return res.status(200).json({
      message: 'Información actualizada correctamente',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil');
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
