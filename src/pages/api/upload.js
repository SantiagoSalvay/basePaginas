import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

// Configuración para permitir el análisis de formularios con archivos
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
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Verificar rol de administrador
    if (session.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Parsear el formulario con formidable
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error al procesar el archivo:', err);
          res.status(500).json({ error: 'Error al procesar el archivo' });
          return resolve();
        }

        try {
          const file = files.file[0]; // Acceder al archivo subido
          
          if (!file) {
            res.status(400).json({ error: 'No se ha subido ningún archivo' });
            return resolve();
          }

          // Generar un nombre de archivo único
          const timestamp = Date.now();
          const ext = path.extname(file.originalFilename);
          const newFilename = `product_${timestamp}${ext}`;
          
          // Ruta del archivo en el sistema de archivos
          const newPath = path.join(uploadDir, newFilename);
          
          // Renombrar el archivo
          await fs.rename(file.filepath, newPath);
          
          // Devolver la URL relativa para acceder al archivo
          const fileUrl = `/uploads/${newFilename}`;
          
          res.status(200).json({ 
            url: fileUrl,
            success: true 
          });
          
          return resolve();
        } catch (error) {
          console.error('Error al guardar el archivo:', error);
          res.status(500).json({ error: 'Error al guardar el archivo' });
          return resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}
