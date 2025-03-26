import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { query } from '../../utils/dbServer';

export default async function handler(req, res) {
  try {
    // Verificar sesión para seguridad
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Obtener la estructura de las tablas
    const tables = [
      'users',
      'user_addresses',
      'orders',
      'order_items',
      'payment_receipts'
    ];

    const result = {};

    for (const table of tables) {
      try {
        // Intentar obtener la estructura de cada tabla
        const tableInfo = await query(`DESCRIBE ${table}`);
        result[table] = tableInfo;
      } catch (error) {
        result[table] = { error: error.message };
      }
    }

    return res.status(200).json({
      success: true,
      tables: result
    });
  } catch (error) {
    console.error('Error de depuración:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
} 