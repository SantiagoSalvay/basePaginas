import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import crypto from 'crypto';

// Whitelist de extensiones y tipos MIME permitidos
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Ruta de subida fuera del acceso directo si fuera posible, 
    // pero para Next.js mantenemos public/uploads con protecciones
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    try {
      await fs.access(uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // Reducido a 5MB por seguridad
    });

    return new Promise((resolve) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error al procesar el archivo');
          res.status(500).json({ error: 'Error al procesar el archivo' });
          return resolve();
        }

        try {
          const fileField = files.receipt ? 'receipt' : 'file';
          const file = files[fileField]?.[0] || files[fileField];

          if (!file) {
            res.status(400).json({ error: 'No se ha subido ningún archivo' });
            return resolve();
          }

          // 1. Validar extensión
          const ext = path.extname(file.originalFilename).toLowerCase();
          if (!ALLOWED_EXTENSIONS.includes(ext)) {
            await fs.unlink(file.filepath); // Borrar archivo temporal
            res.status(400).json({ error: 'Extensión de archivo no permitida' });
            return resolve();
          }

          // 2. Validar MIME type (aunque formidable a veces no lo da exacto, intentamos)
          const mimeType = file.mimetype;
          if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
            await fs.unlink(file.filepath);
            res.status(400).json({ error: 'Tipo de archivo no válido' });
            return resolve();
          }

          // 3. Generar un nombre de archivo criptográficamente seguro
          const randomName = crypto.randomBytes(16).toString('hex');
          const prefix = fileField === 'receipt' ? 'rec' : 'prd';
          const newFilename = `${prefix}_${randomName}${ext}`;
          const newPath = path.join(uploadDir, newFilename);

          // Renombrar y mover
          await fs.rename(file.filepath, newPath);

          const fileUrl = `/uploads/${newFilename}`;

          res.status(200).json({
            url: fileUrl,
            success: true
          });

          return resolve();
        } catch (error) {
          console.error('Error al guardar el archivo');
          res.status(500).json({ error: 'Error al guardar el archivo' });
          return resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error en el servidor');
    res.status(500).json({ error: 'Error en el servidor' });
  }
}
