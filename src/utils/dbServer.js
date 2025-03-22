// src/utils/dbServer.js
// Este archivo SOLO debe ser importado en API Routes (páginas en /api/*)
import mysql from 'mysql2/promise';

// Configuración de la conexión a MySQL
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'cordoba2022',
  database: process.env.MYSQL_DATABASE || 'modavista_db'
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
    
    console.log('Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}; 