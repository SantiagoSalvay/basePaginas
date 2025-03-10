import { connectToDatabase } from "../../../utils/mongodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token requerido' });
    }

    // Conectar a la base de datos
    const { db } = await connectToDatabase();
    
    // Buscar usuario con el token de verificación
    const user = await db.collection('users').findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(404).json({ message: 'Token inválido o expirado' });
    }
    
    // Actualizar el estado de verificación del usuario
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          emailVerified: true,
          verificationToken: null
        } 
      }
    );
    
    return res.status(200).json({ 
      message: 'Correo verificado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(500).json({ message: 'Error al verificar token' });
  }
}
