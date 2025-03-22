// src/pages/api/auth/signup.js
import { getUserByEmail, addUser } from '../../../utils/userDbStore';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Función para generar un ID único
function generateUniqueId() {
  return uuidv4();
}

// Función para generar un token de verificación
function generateVerificationToken() {
  return uuidv4();
}

// Función para enviar correo de verificación
async function sendVerificationEmail(email, name, token) {
  try {
    // Configurar transporte de correo (Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // URL base de la aplicación
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // URL de verificación
    const verificationUrl = `${baseUrl}/auth/verify?token=${token}`;
    
    // Contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verifica tu cuenta en ModaVista',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h1 style="color: #4f46e5; text-align: center;">ModaVista</h1>
          <h2 style="text-align: center;">Verifica tu cuenta</h2>
          <p>Hola ${name},</p>
          <p>Gracias por registrarte en ModaVista. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el botón de abajo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Activar mi cuenta</a>
          </div>
          <p>Si no solicitaste esta verificación, puedes ignorar este correo.</p>
          <p>Este enlace expirará en 24 horas.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p> ${new Date().getFullYear()} ModaVista. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };
    
    // Enviar correo
    console.log('Enviando correo de verificación a:', email);
    await transporter.sendMail(mailOptions);
    console.log('Correo de verificación enviado a:', email);
    
    return true;
  } catch (error) {
    console.error('Error al enviar correo de verificación:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { name, email, password, phone } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el correo ya está registrado
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Este correo electrónico ya está registrado' });
    }

    // Generar token de verificación
    const verificationToken = generateVerificationToken();
    
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear nuevo usuario
    const newUser = {
      id: generateUniqueId(),
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'user',
      emailVerified: false,
      verificationToken,
      createdAt: new Date().toISOString()
    };

    // Guardar usuario usando el userDbStore
    const createdUser = await addUser(newUser);
    
    // Enviar correo de verificación
    await sendVerificationEmail(email, name, verificationToken);

    // Responder con éxito, excluyendo la contraseña
    return res.status(201).json({ 
      message: 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.', 
      user: createdUser,
      requiresVerification: true
    });
    
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
