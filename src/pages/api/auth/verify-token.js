import { verifyUserToken } from '../../../utils/userDbStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token requerido' });
    }
    
    // Verificar el token usando el userDbStore con MySQL
    const result = await verifyUserToken(token);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(500).json({ message: 'Error al verificar token' });
  }
}
