import { getSession } from 'next-auth/react';
import { query } from '../../../utils/dbServer';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar la sesión del usuario
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Asegurarnos de que tenemos un email de usuario válido
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'No se pudo identificar al usuario' 
      });
    }
    
    // Obtener el ID del usuario desde el email
    const userResult = await query(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    );
    
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }
    
    const userId = userResult[0].id;

    // Obtener datos del cuerpo de la solicitud
    const { 
      name, 
      email, 
      address, 
      city, 
      state, 
      postalCode, 
      phone,
      isDefault = false 
    } = req.body;

    // Validar datos requeridos
    if (!name || !email || !address || !city || !state || !postalCode || !phone) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Si es dirección predeterminada, actualizar otras direcciones
    if (isDefault) {
      await query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?',
        [userId]
      );
    }

    // Comprobar si ya existe una dirección para este usuario
    const existingAddresses = await query(
      'SELECT * FROM user_addresses WHERE user_id = ?',
      [userId]
    );

    // Si no hay direcciones, marcar esta como predeterminada
    const shouldBeDefault = isDefault || existingAddresses.length === 0;

    // Insertar nueva dirección
    const result = await query(
      `INSERT INTO user_addresses 
       (user_id, name, email, address, city, state, postal_code, phone, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, address, city, state, postalCode, phone, shouldBeDefault]
    );

    const addressId = result.insertId;

    return res.status(200).json({ 
      success: true, 
      message: 'Dirección guardada correctamente',
      addressId
    });
    
  } catch (error) {
    console.error('Error al guardar la dirección:', error);
    return res.status(500).json({ message: 'Error al guardar la dirección' });
  }
} 