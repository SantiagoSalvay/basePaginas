import { addUser } from '../../../utils/userDbStore';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  // Verifica la clave de seguridad
  const { securityKey, name, email, password, phone } = req.body;
  
  // Asegúrate de cambiar esta clave a algo seguro y guardarla en variables de entorno
  const validKey = process.env.ADMIN_SECURITY_KEY || 'clave_super_secreta_para_crear_administradores';
  
  if (securityKey !== validKey) {
    return res.status(401).json({ message: 'Clave de seguridad no válida' });
  }

  try {
    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Generar un ID único
    const id = uuidv4();
    
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear el administrador
    const adminUser = {
      id,
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'admin',
      emailVerified: true,
      verificationToken: null,
      createdAt: new Date().toISOString()
    };

    // Guardar en la base de datos
    const createdAdmin = await addUser(adminUser);
    
    return res.status(201).json({ 
      message: 'Administrador creado exitosamente', 
      user: createdAdmin
    });
    
  } catch (error) {
    console.error('Error al crear administrador:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
} 