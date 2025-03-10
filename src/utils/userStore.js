// src/utils/userStore.js
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Ruta al archivo JSON de usuarios
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Función para leer usuarios del archivo
const readUsersFromFile = () => {
  try {
    // Verificar si el directorio existe, si no, crearlo
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Verificar si el archivo existe, si no, crearlo con estructura básica
    if (!fs.existsSync(usersFilePath)) {
      const initialData = { 
        users: [
          {
            id: "1",
            name: "Usuario de Prueba",
            email: "usuario@ejemplo.com",
            password: "$2a$10$8KbM4S4ohI9NoIL9jKXiNOjU1XnQYq4HNMGYbZ1HLlVF2gDgOKrUW", // "password" hasheado
            emailVerified: true,
            role: "user",
            createdAt: new Date().toISOString()
          },
          {
            id: "admin",
            name: "Administrador",
            email: "admin@admin",
            password: "$2a$10$8KbM4S4ohI9NoIL9jKXiNOjU1XnQYq4HNMGYbZ1HLlVF2gDgOKrUW", // "admin" hasheado
            emailVerified: true,
            role: "admin",
            createdAt: new Date().toISOString()
          }
        ] 
      };
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

// Función para guardar usuarios en el archivo
const saveUsersToFile = (usersData) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al guardar el archivo de usuarios:', error);
    return false;
  }
};

// Obtener todos los usuarios
export const getUsers = () => {
  const data = readUsersFromFile();
  return [...data.users];
};

// Obtener usuario por email
export const getUserByEmail = (email) => {
  const data = readUsersFromFile();
  return data.users.find(user => user.email === email);
};

// Agregar un nuevo usuario
export const addUser = (user) => {
  const data = readUsersFromFile();
  
  // Verificar si el email ya existe
  if (data.users.some(u => u.email === user.email)) {
    throw new Error("El correo electrónico ya está registrado");
  }
  
  // Agregar el usuario
  const updatedData = {
    ...data,
    users: [...data.users, user]
  };
  
  // Guardar en el archivo
  const saved = saveUsersToFile(updatedData);
  if (!saved) {
    throw new Error("Error al guardar el usuario");
  }
  
  return user;
};

// Verificar credenciales
export const verifyCredentials = (email, password) => {
  const user = getUserByEmail(email);
  
  if (user) {
    // Verificar si la contraseña coincide
    const passwordMatch = bcrypt.compareSync(password, user.password);
    
    if (passwordMatch) {
      // No devolver la contraseña
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
  
  return null;
};

// Actualizar usuario
export const updateUser = (id, userData) => {
  const data = readUsersFromFile();
  
  const updatedData = {
    ...data,
    users: data.users.map(user => {
      if (user.id === id) {
        return { ...user, ...userData };
      }
      return user;
    })
  };
  
  const saved = saveUsersToFile(updatedData);
  if (!saved) {
    throw new Error("Error al actualizar el usuario");
  }
  
  return updatedData.users.find(user => user.id === id);
};

// Eliminar usuario
export const deleteUser = (id) => {
  const data = readUsersFromFile();
  
  const updatedData = {
    ...data,
    users: data.users.filter(user => user.id !== id)
  };
  
  const saved = saveUsersToFile(updatedData);
  if (!saved) {
    throw new Error("Error al eliminar el usuario");
  }
  
  return true;
};
