// test-auth.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function testAuthentication() {
  try {
    // Configuración de la conexión a MySQL
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'modavista_db'
    });

    console.log('Conexión a la base de datos establecida');
    
    // Buscar el usuario admin
    const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', ['admin@admin']);
    
    if (users.length === 0) {
      console.log('El usuario admin@admin no existe en la base de datos');
      await connection.end();
      return;
    }
    
    const admin = users[0];
    console.log('Usuario encontrado:');
    console.log(`ID: ${admin.id}`);
    console.log(`Nombre: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Rol: ${admin.role}`);
    console.log(`Password hash: ${admin.password}`);
    
    // Probar la contraseña "admin"
    const testPassword = 'admin';
    console.log(`\nProbando contraseña: "${testPassword}"`);
    
    // Verificar contraseña con bcrypt
    try {
      const passwordMatch = await bcrypt.compare(testPassword, admin.password);
      console.log(`Resultado de la verificación: ${passwordMatch ? 'CORRECTO ✓' : 'INCORRECTO ✗'}`);
      
      if (!passwordMatch) {
        // Generar un nuevo hash para "admin"
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(testPassword, salt);
        console.log(`\nGenerando nuevo hash para "${testPassword}": ${newPasswordHash}`);
        
        // Actualizar la contraseña
        await connection.execute(
          'UPDATE users SET password = ? WHERE id = ?',
          [newPasswordHash, admin.id]
        );
        console.log('Contraseña actualizada correctamente');
      }
    } catch (error) {
      console.error('Error en la verificación de contraseña:', error);
    }
    
    await connection.end();
    console.log('Conexión cerrada');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuthentication(); 