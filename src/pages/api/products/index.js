import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { addProduct, getAllProducts, removeProduct, updateProduct } from "../../../utils/productStore";
import { staticProducts } from "../../../utils/staticProducts";

// Verificar si un producto es estático (ID en rangos específicos)
const isStaticProduct = (id) => {
  // Los productos estáticos tienen IDs en rangos específicos:
  // Camisas: 1001-1999
  // Pantalones: 2001-2999
  // Vestidos: 3001-3999
  // Etc.
  return (
    (id >= 1001 && id <= 1999) || // Camisas
    (id >= 2001 && id <= 2999) || // Pantalones
    (id >= 3001 && id <= 3999) || // Vestidos
    (id >= 4001 && id <= 4999) || // Chaquetas
    (id >= 5001 && id <= 5999)    // Accesorios
  );
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // GET - Obtener todos los productos
  if (req.method === "GET") {
    const dynamicProducts = getAllProducts();
    
    // Combinar productos estáticos con productos dinámicos
    const combinedProducts = {};
    
    // Primero, añadir todas las categorías de productos estáticos
    Object.keys(staticProducts).forEach(category => {
      combinedProducts[category] = [...staticProducts[category]];
    });
    
    // Luego, añadir productos dinámicos, combinando con los estáticos si la categoría ya existe
    Object.keys(dynamicProducts).forEach(category => {
      if (combinedProducts[category]) {
        combinedProducts[category] = [...combinedProducts[category], ...dynamicProducts[category]];
      } else {
        combinedProducts[category] = [...dynamicProducts[category]];
      }
    });
    
    return res.status(200).json(combinedProducts);
  }

  // POST - Añadir un nuevo producto (solo para administradores)
  if (req.method === "POST") {
    // Verificar autenticación
    if (!session) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Verificar rol de administrador
    if (session.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    try {
      const product = req.body;
      
      // Validar datos del producto
      if (!product.name || !product.price || !product.category || !product.image) {
        return res.status(400).json({ error: "Datos de producto incompletos" });
      }

      const newProduct = addProduct(product);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error al crear producto:", error);
      return res.status(500).json({ error: "Error al crear el producto" });
    }
  }

  // DELETE - Eliminar un producto (solo para administradores)
  if (req.method === "DELETE") {
    // Verificar autenticación
    if (!session) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Verificar rol de administrador
    if (session.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: "ID de producto no proporcionado" });
      }

      // Verificar si es un producto estático (no se pueden eliminar)
      if (isStaticProduct(parseInt(id))) {
        return res.status(400).json({ error: "No se pueden eliminar productos estáticos" });
      }

      removeProduct(parseInt(id));
      return res.status(200).json({ success: true, message: "Producto eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return res.status(500).json({ error: "Error al eliminar el producto" });
    }
  }

  // PUT - Actualizar un producto (solo para administradores)
  if (req.method === "PUT") {
    // Verificar autenticación
    if (!session) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Verificar rol de administrador
    if (session.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    try {
      const product = req.body;
      
      // Validar datos del producto
      if (!product.id || !product.name || !product.price || !product.category || !product.image) {
        return res.status(400).json({ error: "Datos de producto incompletos" });
      }

      // Verificar si es un producto estático (no se pueden editar)
      if (isStaticProduct(product.id)) {
        return res.status(400).json({ error: "No se pueden editar productos estáticos" });
      }

      const updatedProduct = updateProduct(product);
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return res.status(500).json({ error: "Error al actualizar el producto" });
    }
  }

  // Método no permitido
  return res.status(405).json({ error: "Método no permitido" });
}
