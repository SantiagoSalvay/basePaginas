import fs from 'fs';
import path from 'path';

// Ruta al archivo JSON de usuarios
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Función para leer usuarios
const getUsers = () => {
  try {
    // Verificar si el directorio existe, si no, crearlo
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Verificar si el archivo existe, si no, crearlo con estructura básica
    if (!fs.existsSync(usersFilePath)) {
      const initialData = { users: [] };
      fs.writeFileSync(usersFilePath, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    
    const fileData = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error al leer el archivo de usuarios:', error);
    return { users: [] };
  }
};

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

    // Obtener usuarios
    const usersData = getUsers();
    
    // Buscar el usuario por token
    const user = usersData.users.find(u => u.resetToken === token);
    
    if (!user) {
      return res.status(400).json({ error: 'Token inválido' });
    }
    
    // Verificar si el token ha expirado
    if (user.resetTokenExpiry) {
      const expiryDate = new Date(user.resetTokenExpiry);
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
