import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { query, queryRaw, beginTransaction, commitTransaction, rollbackTransaction } from '../../../utils/dbServer';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    // Verificar sesión y rol de administrador usando getServerSession en lugar de getSession
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    
    // Verificar si el usuario es administrador
    const userEmail = session.user.email;
    const userResult = await query(
      'SELECT role FROM users WHERE email = ?',
      [userEmail]
    );
    
    if (!userResult || userResult.length === 0 || userResult[0].role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    // Obtener datos del cuerpo
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden o estado no proporcionado' 
      });
    }

    // Validar que el estado sea válido
    const validStatuses = ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }
    
    // Obtener información de la orden para el email
    const orderData = await query(
      `SELECT o.id, u.name, u.email, o.status
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );
    
    if (!orderData || orderData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    try {
      // Iniciar transacción usando beginTransaction
      await beginTransaction();
      
      // Actualizar el estado de la orden
      await query(
        `UPDATE orders 
         SET status = ?, 
             updated_at = NOW()
         WHERE id = ?`,
        [status, orderId]
      );
      
      // Confirmar la transacción con commitTransaction
      await commitTransaction();
      
      // Enviar notificación por email al usuario
      await sendStatusUpdateEmail(
        orderData[0].email,
        orderData[0].name,
        orderId,
        status
      );

      return res.status(200).json({ 
        success: true, 
        message: 'Estado de la orden actualizado correctamente'
      });
        
    } catch (error) {
      // Revertir en caso de error con rollbackTransaction
      await rollbackTransaction();
      console.error('Error al actualizar el estado de la orden:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado de la orden'
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
} 

async function sendStatusUpdateEmail(email, name, orderId, status) {
  // Configure email transporter (use your actual email service credentials)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  // Prepare email content based on order status
  let subject = `Actualización de tu orden #${orderId} en ModaVista`;
  let statusText = "";
  let additionalInfo = "";

  switch (status) {
    case "processing":
      statusText = "Procesando";
      additionalInfo = "¡Estamos preparando tu pedido! Pronto comenzaremos con el proceso de envío.";
      break;
    case "shipped":
      statusText = "Enviado";
      additionalInfo = "¡Tu pedido ha sido enviado! Tu paquete está en camino hacia nuestro socio de distribución.";
      break;
    case "in_transit":
      statusText = "En camino";
      additionalInfo = "¡Tu pedido está en camino! Pronto llegará a tu dirección de envío.";
      break;
    case "delivered":
      statusText = "Entregado";
      additionalInfo = "¡Tu pedido ha sido entregado! Esperamos que disfrutes tus productos.";
      break;
    case "completed":
      statusText = "Finalizado";
      additionalInfo = "¡Tu orden ha sido completada! Gracias por tu compra.";
      break;
    default:
      statusText = status;
      additionalInfo = "Gracias por tu compra en ModaVista.";
  }

  // Email HTML content
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Actualización de tu Orden</h2>
      <p>Hola ${name},</p>
      <p>El estado de tu orden #${orderId} ha sido actualizado a: <strong style="color: #4a5568;">${statusText}</strong></p>
      <p>${additionalInfo}</p>
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px;">Puedes ver los detalles completos de tu orden en tu <a href="${process.env.NEXTAUTH_URL}/user/dashboard?view=orders" style="color: #3182ce; text-decoration: none;">panel de usuario</a>.</p>
      </div>
      <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #718096;">
        © ${new Date().getFullYear()} ModaVista. Todos los derechos reservados.
      </p>
    </div>
  `;

  // Send the email
  try {
    await transporter.sendMail({
      from: `"ModaVista" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject,
      html: htmlContent,
    });
    console.log(`Email de actualización enviado a ${email} para la orden ${orderId}`);
  } catch (error) {
    console.error("Error al enviar email de actualización:", error);
    // Don't throw error, so order status still updates even if email fails
  }
} 