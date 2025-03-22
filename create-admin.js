// create-admin.js
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  try {
    // Configuración de la conexión a MySQL
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'modavista_db'
    });

    console.log('Conexión a la base de datos establecida');
    
    // Insertar usuario administrador
    const adminId = uuidv4();
    const adminData = {
      id: adminId,
      name: 'Administrador',
      email: 'admin@admin',
      // Hash de la contraseña 'admin'
      password: '$2a$10$3i9SL5/ognyHCz.mw2beP.oFQxJ0tF32Qwj3usrwBaqYD/G/JLhnm',
      role: 'admin',
      email_verified: 1,
      created_at: new Date()
    };
    
    // Verificar si el admin ya existe
    const [existingAdmins] = await connection.execute(
      'SELECT * FROM users WHERE email = ?', 
      [adminData.email]
    );
    
    if (existingAdmins.length > 0) {
      console.log('El administrador ya existe, actualizando su contraseña...');
      // Actualizar contraseña del admin existente
      await connection.execute(
        'UPDATE users SET password = ?, role = "admin", email_verified = 1 WHERE email = ?',
        [adminData.password, adminData.email]
      );
      console.log('Contraseña actualizada para el administrador existente.');
    } else {
      // Crear nuevo admin
      await connection.execute(
        `INSERT INTO users (id, name, email, password, role, email_verified, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          adminData.id, 
          adminData.name, 
          adminData.email, 
          adminData.password, 
          adminData.role, 
          adminData.email_verified, 
          adminData.created_at
        ]
      );
      console.log('Administrador creado exitosamente');
    }
    
    // Verificar todos los usuarios
    const [users] = await connection.execute('SELECT id, name, email, role FROM users');
    console.log('Usuarios en la base de datos:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Nombre: ${user.name}, Email: ${user.email}, Rol: ${user.role}`);
    });
    
    await connection.end();
    console.log('Conexión cerrada');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin(); 