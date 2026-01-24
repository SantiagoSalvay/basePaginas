import nodemailer from "nodemailer";
import crypto from 'crypto';
import { getUserByEmail, updateUser } from "../../../utils/userDbStore";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }

    // Buscar usuario en la base de datos real (Supabase)
    const user = await getUserByEmail(email);

    if (!user) {
      // Por seguridad no revelamos si no existe
      return res.status(200).json({ message: 'Si el correo existe, se enviará un enlace de verificación' });
    }

    // Generar token seguro con expiración (24h)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    // Actualizar usuario
    await updateUser(user.id, {
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires.toISOString(),
      email_verified: false
    });

    // Enviar correo
    await sendVerificationEmail(email, verificationToken);

    return res.status(200).json({ message: 'Correo de verificación enviado' });
  } catch (error) {
    console.error('Error en proceso de verificación de email');
    return res.status(500).json({ message: 'Error al enviar correo de verificación' });
  }
}

async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD
    },
    secure: process.env.EMAIL_SERVER_SECURE === 'true'
  });

  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

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

  await transporter.sendMail(mailOptions);
}
