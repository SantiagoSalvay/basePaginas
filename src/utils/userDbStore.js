import bcrypt from 'bcryptjs';
import { getUserByEmail as getSupabaseUserByEmail, getUserById as getSupabaseUserById, createUser, updateUser as updateSupabaseUser } from './supabaseDb';
import { supabaseAdmin } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Obtener todos los usuarios
export const getUsers = async () => {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Obtener usuario por email
export const getUserByEmail = async (email) => {
  try {
    return await getSupabaseUserByEmail(email);
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    throw error;
  }
};

// Obtener usuario por ID
export const getUserById = async (id) => {
  try {
    return await getSupabaseUserById(id);
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

    // Hashear la contraseña si no está hasheada
    let hashedPassword = password;
    if (!password.startsWith('$2a$') && !password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Crear usuario usando supabaseDb
    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role,
      email_verified: emailVerified,
      verification_token: verificationToken || null
    });

    return newUser;
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

    // Preparar datos para actualizar
    const updateData = { ...userData };

    // Hashear la contraseña si se proporciona y no está hasheada
    if (updateData.password && !updateData.password.startsWith('$2a$') && !updateData.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Convertir emailVerified a email_verified
    if ('emailVerified' in updateData) {
      updateData.email_verified = updateData.emailVerified;
      delete updateData.emailVerified;
    }

    // Usar supabaseDb para actualizar
    return await updateSupabaseUser(id, updateData);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async (id) => {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

// Verificar token de usuario
export const verifyUserToken = async (token) => {
  try {
    // Buscar usuario por token
    const { data: users, error: searchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('verification_token', token);

    if (searchError) throw searchError;

    if (!users || users.length === 0) {
      return { success: false, message: 'Token inválido o expirado' };
    }

    const user = users[0];

    // Actualizar el estado de verificación del usuario
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Correo verificado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Error al verificar token:', error);
    throw error;
  }
}; 