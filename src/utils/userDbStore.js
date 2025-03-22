import bcrypt from 'bcryptjs';
import { query } from './dbServer';
import { v4 as uuidv4 } from 'uuid';

// Obtener todos los usuarios
export const getUsers = async () => {
  try {
    return await query('SELECT * FROM users');
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Obtener usuario por email
export const getUserByEmail = async (email) => {
  try {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    throw error;
  }
};

// Obtener usuario por ID
export const getUserById = async (id) => {
  try {
    const users = await query('SELECT * FROM users WHERE id = ?', [id]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    throw error;
  }
};

// Verificar credenciales de usuario
export const verifyCredentials = async (email, password) => {
  try {
    console.log(`Intentando verificar credenciales para: ${email}`);
    const user = await getUserByEmail(email);
    
    if (!user) {
      console.log(`Usuario no encontrado para el email: ${email}`);
      return null;
    }
    
    console.log(`Usuario encontrado: ${user.email}, rol: ${user.role}`);
    
    if (user.password) {
      // Verificar si la contraseña coincide
      console.log('Comparando contraseñas...');
      try {
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log(`Resultado de comparación de contraseñas: ${passwordMatch}`);
        
        if (passwordMatch) {
          // No devolver la contraseña
          const { password, ...userWithoutPassword } = user;
          console.log('Autenticación exitosa, devolviendo usuario sin contraseña');
          return userWithoutPassword;
        }
      } catch (bcryptError) {
        console.error('Error en la comparación de bcrypt:', bcryptError);
        // Si hay un error en el formato del hash, intentamos una comparación directa (solo para depuración)
        console.log('Contraseña proporcionada:', password);
        console.log('Hash almacenado:', user.password);
      }
    } else {
      console.log('Usuario no tiene contraseña almacenada');
    }
    
    console.log('Fallo en la autenticación');
    return null;
  } catch (error) {
    console.error('Error al verificar credenciales:', error);
    throw error;
  }
};

// Agregar un nuevo usuario
export const addUser = async (userData) => {
  try {
    const { name, email, password, phone, role = 'user', emailVerified = false, verificationToken } = userData;
    
    // Verificar si el email ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }
    
    // Generar un ID único si no se proporciona
    const id = userData.id || uuidv4();
    
    // Hashear la contraseña si no está hasheada
    let hashedPassword = password;
    if (!password.startsWith('$2a$') && !password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }
    
    // Insertar el nuevo usuario
    await query(
      `INSERT INTO users (id, name, email, password, phone, role, email_verified, verification_token, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, name, email, hashedPassword, phone || null, role, emailVerified ? 1 : 0, verificationToken || null]
    );
    
    // Devolver el usuario creado (sin la contraseña)
    return {
      id,
      name,
      email,
      phone,
      role,
      emailVerified,
      verificationToken,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    throw error;
  }
};

// Actualizar usuario
export const updateUser = async (id, userData) => {
  try {
    const user = await getUserById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    const fieldsToUpdate = [];
    const params = [];
    
    // Construir la consulta dinámicamente
    for (const [key, value] of Object.entries(userData)) {
      // Convertir camelCase a snake_case para los nombres de campos SQL
      const fieldName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      // Manejar casos especiales (campos que requieren transformación)
      if (key === 'password' && value && !value.startsWith('$2a$') && !value.startsWith('$2b$')) {
        // Hashear la contraseña si no está hasheada
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(value, salt);
        fieldsToUpdate.push(`${fieldName} = ?`);
        params.push(hashedPassword);
      } else if (key === 'emailVerified') {
        fieldsToUpdate.push('email_verified = ?');
        params.push(value ? 1 : 0);
      } else if (value !== undefined) {
        fieldsToUpdate.push(`${fieldName} = ?`);
        params.push(value);
      }
    }
    
    if (fieldsToUpdate.length === 0) {
      return user; // No hay campos para actualizar
    }
    
    // Agregar ID a los parámetros
    params.push(id);
    
    // Ejecutar la consulta de actualización
    await query(
      `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
      params
    );
    
    // Obtener y devolver el usuario actualizado
    return await getUserById(id);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async (id) => {
  try {
    const result = await query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

// Verificar token de usuario
export const verifyUserToken = async (token) => {
  try {
    const users = await query('SELECT * FROM users WHERE verification_token = ?', [token]);
    
    if (users.length === 0) {
      return { success: false, message: 'Token inválido o expirado' };
    }
    
    const user = users[0];
    
    // Actualizar el estado de verificación del usuario
    await query(
      'UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?',
      [user.id]
    );
    
    return { 
      success: true, 
      message: 'Correo verificado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Error al verificar token:', error);
    throw error;
  }
}; 