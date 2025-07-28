// src/utils/dbServer.js
// Este archivo SOLO debe ser importado en API Routes (páginas en /api/*)
import mysql from 'mysql2/promise';
import 'dotenv/config';

// Configuración de la conexión a MySQL
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
};

// Pool de conexiones singleton
let pool;

// Función para obtener una conexión del pool
export const getConnection = async () => {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
      console.log('Conexión a la base de datos MySQL establecida');
    } catch (error) {
      console.error('Error al conectar con la base de datos MySQL:', error);
      throw error;
    }
  }
  return pool;
};

// Función para ejecutar una consulta SQL
export const query = async (sql, params = []) => {
  try {
    const connection = await getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error al ejecutar consulta SQL:', error);
    throw error;
  }
};

// Función para ejecutar una consulta SQL sin prepared statements
export const queryRaw = async (sql) => {
  try {
    const connection = await getConnection();
    const [results] = await connection.query(sql);
    return results;
  } catch (error) {
    console.error('Error al ejecutar consulta SQL raw:', error);
    throw error;
  }
};

// Funciones para manejar transacciones
export const beginTransaction = async () => {
  try {
    const connection = await getConnection();
    await connection.query('START TRANSACTION');
    return true;
  } catch (error) {
    console.error('Error al iniciar transacción:', error);
    throw error;
  }
};

export const commitTransaction = async () => {
  try {
    const connection = await getConnection();
    await connection.query('COMMIT');
    return true;
  } catch (error) {
    console.error('Error al hacer commit de la transacción:', error);
    throw error;
  }
};

export const rollbackTransaction = async () => {
  try {
    const connection = await getConnection();
    await connection.query('ROLLBACK');
    return true;
  } catch (error) {
    console.error('Error al hacer rollback de la transacción:', error);
    throw error;
  }
};

// Función para inicializar la base de datos (crear tablas si no existen)
export const initDatabase = async () => {
  try {
    const connection = await getConnection();
    
    // Crear tabla de usuarios
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(100),
        reset_token VARCHAR(100),
        reset_token_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de direcciones de usuarios
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Crear tabla de órdenes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        address_id INT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'approved', 'completed', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
        payment_id VARCHAR(100),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (address_id) REFERENCES user_addresses(id) ON DELETE CASCADE
      )
    `);
    
    // Crear tabla para ítems de órdenes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_image VARCHAR(255),
        size VARCHAR(20),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    
    // Crear tabla para comprobantes de pago
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payment_receipts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        receipt_image VARCHAR(255) NOT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        admin_notes TEXT,
        verified BOOLEAN DEFAULT FALSE,
        verified_date DATETIME,
        verified_by VARCHAR(36),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}; 