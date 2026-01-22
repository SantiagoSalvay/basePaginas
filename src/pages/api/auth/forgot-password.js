import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, updateUser } from '../../../utils/userDbStore';

// Función para enviar correo de recuperación de contraseña
async function sendPasswordResetEmail(email, name, token) {
  console.log('Iniciando envío de correo de recuperación a:', email);

  try {
    // Configurar el transportador de correo
    console.log('Configurando transportador de correo con:', {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD ? '********' : 'No configurado'
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // URL base para el enlace de restablecimiento
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
    console.log('URL de restablecimiento:', resetUrl);

    // Plantilla de correo HTML
    const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #333; margin-bottom: 10px;">ModaVista</h1>
          <p style="color: #666; font-size: 16px;">Recuperación de Contraseña</p>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
          <p style="margin-bottom: 15px;">Hola ${name},</p>
          <p style="margin-bottom: 15px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Recuperar Contraseña</a>
          </div>
          <p style="margin-bottom: 15px;">O copia y pega el siguiente enlace en tu navegador:</p>
          <p style="margin-bottom: 15px; word-break: break-all; color: #4a90e2;">${resetUrl}</p>
          <p style="margin-bottom: 15px;">Si no has solicitado este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.</p>
          <p style="margin-bottom: 15px;">Este enlace expirará en 1 hora por motivos de seguridad.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #999; font-size: 14px;">${new Date().getFullYear()} ModaVista. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    // Opciones del correo
    const mailOptions = {
      from: `"ModaVista" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperación de Contraseña - ModaVista',
      html: mailHtml,
    };

    console.log('Opciones de correo configuradas:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Enviar el correo
    console.log('Intentando enviar correo...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de recuperación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error detallado al enviar correo de recuperación:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Solo permitir solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email } = req.body;
    console.log('Solicitud de recuperación de contraseña para:', email);

    if (!email) {
      return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }

    // Buscar el usuario por email usando Supabase
    const user = await getUserByEmail(email);

    if (!user) {
      console.log('Usuario no encontrado para el correo:', email);
      // Por seguridad, no revelamos si el correo existe o no
      return res.status(200).json({ success: true, message: 'Si el correo existe, se enviará un enlace de recuperación' });
    }

    console.log('Usuario encontrado:', user.name);

    // Generar token de restablecimiento
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Expira en 1 hora
    console.log('Token generado:', resetToken);

    // Actualizar usuario con token de restablecimiento
    // Nota: Supabase usa snake_case para las columnas
    const updateData = {
      reset_token: resetToken,
      reset_token_expires: resetTokenExpiry.toISOString(),
    };

    const updatedUser = await updateUser(user.id, updateData);

    if (!updatedUser) {
      console.error('Error al guardar el token en la base de datos');
      return res.status(500).json({ error: 'Error al generar el token de recuperación' });
    }

    console.log('Token guardado correctamente');

    // Enviar correo de recuperación
    const emailSent = await sendPasswordResetEmail(email, user.name, resetToken);

    if (!emailSent) {
      console.error('Error al enviar el correo de recuperación');
      return res.status(500).json({ error: 'Error al enviar el correo de recuperación' });
    }

    console.log('Proceso de recuperación completado correctamente');
    return res.status(200).json({ success: true, message: 'Correo de recuperación enviado correctamente' });
  } catch (error) {
    console.error('Error en el endpoint de recuperación de contraseña:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
