import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Ruta al archivo JSON de usuarios
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Función para leer usuarios
const getUsers = () => {
  try {
    // Verificar si el directorio existe, si no, crearlo
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Verificar si el archivo existe, si no, crearlo con estructura básica
    if (!fs.existsSync(usersFilePath)) {
      const initialData = { users: [] };
      fs.writeFileSync(usersFilePath, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    
    const fileData = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error al leer el archivo de usuarios:', error);
    return { users: [] };
  }
};

// Función para guardar usuarios
const saveUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al guardar el archivo de usuarios:', error);
    return false;
  }
};

// Función para enviar correo de verificación
async function sendVerificationEmail(email, name, token) {
  // Configurar el transportador de correo
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // URL base para el enlace de verificación
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/auth/verify?token=${token}`;

  // Plantilla de correo HTML
  const mailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #333; margin-bottom: 10px;">ModaVista</h1>
        <p style="color: #666; font-size: 16px;">Verificación de Cuenta</p>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p style="margin-bottom: 15px;">Hola ${name},</p>
        <p style="margin-bottom: 15px;">Gracias por registrarte en ModaVista. Para activar tu cuenta, por favor haz clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verificar mi cuenta</a>
        </div>
        <p style="margin-bottom: 15px;">O copia y pega el siguiente enlace en tu navegador:</p>
        <p style="margin-bottom: 15px; word-break: break-all; color: #4a90e2;">${verificationUrl}</p>
        <p style="margin-bottom: 15px;">Si no has solicitado esta verificación, puedes ignorar este correo.</p>
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
    subject: 'Verifica tu cuenta de ModaVista',
    html: mailHtml,
  };

  // Enviar el correo
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar correo:', error);
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

    if (!email) {
      return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }

    // Obtener usuarios
    const usersData = getUsers();
    
    // Buscar el usuario por email
    const user = usersData.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ error: 'El correo ya ha sido verificado' });
    }
    
    // Generar nuevo token de verificación
    const newToken = uuidv4();
    
    // Actualizar token de verificación del usuario
    const updatedUsers = {
      ...usersData,
      users: usersData.users.map(u => {
        if (u.email === email) {
          return {
            ...u,
            verificationToken: newToken,
          };
        }
        return u;
      }),
    };
    
    // Guardar usuarios actualizados
    const saved = saveUsers(updatedUsers);
    
    if (!saved) {
      return res.status(500).json({ error: 'Error al actualizar el token de verificación' });
    }
    
    // Enviar correo de verificación
    const emailSent = await sendVerificationEmail(email, user.name, newToken);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Error al enviar el correo de verificación' });
    }
    
    return res.status(200).json({ success: true, message: 'Correo de verificación reenviado correctamente' });
  } catch (error) {
    console.error('Error en el endpoint de reenvío de verificación:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
