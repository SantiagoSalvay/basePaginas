import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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

// Función para guardar usuarios
const saveUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al guardar el archivo de usuarios:', error);
    return false;
  }
};

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
    
    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Actualizar usuario con nueva contraseña y eliminar tokens de restablecimiento
    const updatedUsers = {
      ...usersData,
      users: usersData.users.map(u => {
        if (u.resetToken === token) {
          return {
            ...u,
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
          };
        }
        return u;
      }),
    };
    
    // Guardar usuarios actualizados
    const saved = saveUsers(updatedUsers);
    
    if (!saved) {
      return res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }
    
    return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
