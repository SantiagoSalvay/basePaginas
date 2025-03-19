import fs from 'fs';
import path from 'path';

// Local storage path for users
const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

// Helper function to read users
const getUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      // Create directory if it doesn't exist
      const dir = path.dirname(USERS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Helper function to write users
const saveUsers = (users) => {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users file:', error);
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token requerido' });
    }

    // Get users from local storage
    const users = getUsers();
    
    // Buscar usuario con el token de verificación
    const userIndex = users.findIndex(user => user.verificationToken === token);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Token inválido o expirado' });
    }
    
    // Actualizar el estado de verificación del usuario
    users[userIndex] = {
      ...users[userIndex],
      emailVerified: true,
      verificationToken: null
    };
    
    // Save updated users
    saveUsers(users);
    
    return res.status(200).json({ 
      message: 'Correo verificado exitosamente',
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email
      }
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(500).json({ message: 'Error al verificar token' });
  }
}
