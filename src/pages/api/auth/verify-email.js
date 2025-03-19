import nodemailer from "nodemailer";
import fs from 'fs';
import path from 'path';

// Local storage path for users
const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

// Helper function to read users
const getUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      // Create directory if it doesn't exist
      const dir = path.dirname(USERS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Helper function to write users
const saveUsers = (users) => {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users file:', error);
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }

    // Generar token de verificación
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
    
    // Get users from local storage
    const users = getUsers();
    
    // Buscar si el usuario ya existe
    const existingUserIndex = users.findIndex(user => user.email === email);
    
    if (existingUserIndex === -1) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Actualizar el usuario con el token de verificación
    users[existingUserIndex] = {
      ...users[existingUserIndex],
      verificationToken,
      emailVerified: false
    };
    
    // Save updated users
    saveUsers(users);
    
    // Enviar correo de verificación
    await sendVerificationEmail(email, verificationToken);
    
    return res.status(200).json({ message: 'Correo de verificación enviado' });
  } catch (error) {
    console.error('Error al enviar correo de verificación:', error);
    return res.status(500).json({ message: 'Error al enviar correo de verificación' });
  }
}

// Función para enviar correo de verificación
async function sendVerificationEmail(email, token) {
  // Configurar transporte de correo
  const transporter = nodemailer.createTransport({
    // En un entorno de producción, configura tu servicio de correo real aquí
    // Para desarrollo, puedes usar servicios como Mailtrap, SendGrid, etc.
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD
    },
    secure: process.env.EMAIL_SERVER_SECURE === 'true'
  });
  
  // URL de verificación
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  
  // Contenido del correo
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verifica tu cuenta en ModaVista',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h1 style="color: #4f46e5; text-align: center;">ModaVista</h1>
        <h2 style="text-align: center;">Verifica tu cuenta</h2>
        <p>Gracias por registrarte en ModaVista. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el botón de abajo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Activar mi cuenta</a>
        </div>
        <p>Si no solicitaste esta verificación, puedes ignorar este correo.</p>
        <p>Este enlace expirará en 24 horas.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ModaVista. Todos los derechos reservados.</p>
        </div>
      </div>
    `
  };
  
  // Enviar correo
  await transporter.sendMail(mailOptions);
}
