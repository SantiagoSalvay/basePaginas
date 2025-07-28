import { getConnection } from '../../utils/dbServer';

export default async function handler(req, res) {
  try {
    const connection = await getConnection();
    await connection.execute('SELECT 1');
    res.status(200).json({ 
      status: 'success', 
      message: 'Conexión a la base de datos exitosa',
      config: {
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT
      }
    });
  } catch (error) {
    console.error('Error de conexión:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al conectar con la base de datos',
      error: error.message
    });
  }
} 