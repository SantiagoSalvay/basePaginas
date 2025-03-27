import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (session) {
      return res.status(200).json({
        success: true,
        message: "Sesión válida",
        user: session.user
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "No autenticado"
      });
    }
  } catch (error) {
    console.error("Error al verificar sesión:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message
    });
  }
} 