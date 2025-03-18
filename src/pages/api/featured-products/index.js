import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import fs from 'fs';
import path from 'path';

// Ruta al archivo JSON que almacenará los productos destacados
const featuredProductsPath = path.join(process.cwd(), 'data', 'featured-products.json');

// Función para asegurar que el directorio data existe
const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Función para leer los productos destacados
const getFeaturedProducts = () => {
  ensureDirectoryExists();
  
  if (!fs.existsSync(featuredProductsPath)) {
    // Si el archivo no existe, crear uno vacío
    fs.writeFileSync(featuredProductsPath, JSON.stringify([]));
    return [];
  }
  
  try {
    const data = fs.readFileSync(featuredProductsPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error al leer productos destacados:', err);
    return [];
  }
};

// Función para guardar los productos destacados
const saveFeaturedProducts = (products) => {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(featuredProductsPath, JSON.stringify(products, null, 2));
    return true;
  } catch (err) {
    console.error('Error al guardar productos destacados:', err);
    return false;
  }
};

export default async function handler(req, res) {
  // GET - Obtener todos los productos destacados
  if (req.method === "GET") {
    const featuredProducts = getFeaturedProducts();
    return res.status(200).json(featuredProducts);
  }

  // Verificar autenticación para operaciones de escritura
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: "No has iniciado sesión" });
  }

  // Verificar si el usuario es administrador
  try {
    const usersData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'users.json'), 'utf8'));
    const users = usersData.users || [];
    const currentUser = users.find(user => user.email === session.user.email);
    
    if (!currentUser) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    if (currentUser.role !== 'admin') {
      return res.status(401).json({ message: "No tienes permisos de administrador" });
    }
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return res.status(500).json({ message: "Error al verificar permisos de administrador" });
  }

  // POST - Añadir un producto a la colección destacada
  if (req.method === "POST") {
    const { productId } = req.body;

    if (!productId || typeof productId !== 'number') {
      return res.status(400).json({ message: "Se requiere un ID de producto válido" });
    }

    // Obtener los productos destacados actuales
    const featuredProducts = getFeaturedProducts();
    
    // Verificar si el producto ya está en la colección destacada
    if (featuredProducts.includes(productId)) {
      return res.status(400).json({ message: "El producto ya está en la colección destacada" });
    }

    // Añadir el ID del producto a la colección destacada
    featuredProducts.push(productId);
    
    // Guardar los cambios
    if (!saveFeaturedProducts(featuredProducts)) {
      return res.status(500).json({ message: "Error al guardar los productos destacados" });
    }
    
    return res.status(201).json({ message: "Producto añadido a la colección destacada" });
  }

  // DELETE - Eliminar un producto de la colección destacada
  if (req.method === "DELETE") {
    const { productId } = req.body;

    if (!productId || typeof productId !== 'number') {
      return res.status(400).json({ message: "Se requiere un ID de producto válido" });
    }

    // Obtener los productos destacados actuales
    let featuredProducts = getFeaturedProducts();
    
    // Verificar si el producto existe en la colección destacada
    if (!featuredProducts.includes(productId)) {
      return res.status(404).json({ message: "Producto no encontrado en la colección destacada" });
    }

    // Eliminar el producto de la colección destacada
    featuredProducts = featuredProducts.filter(id => id !== productId);
    
    // Guardar los cambios
    if (!saveFeaturedProducts(featuredProducts)) {
      return res.status(500).json({ message: "Error al guardar los cambios" });
    }
    
    return res.status(200).json({ message: "Producto eliminado de la colección destacada" });
  }

  // Método no permitido
  return res.status(405).json({ message: "Método no permitido" });
}
