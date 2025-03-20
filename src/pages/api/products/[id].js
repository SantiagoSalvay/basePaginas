import { getProductById } from "../../../utils/productStore";
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

// Función para buscar un producto estático por ID
const findStaticProductById = (id) => {
  // Convertir el ID a número para comparación
  const numId = parseInt(id, 10);
  
  // Buscar en todas las categorías de productos estáticos
  for (const category in staticProducts) {
    const product = staticProducts[category].find(p => p.id === numId);
    if (product) {
      return product;
    }
  }
  
  return null;
};

export default async function handler(req, res) {
  // Solo permitir peticiones GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: "ID de producto no proporcionado" });
    }

    const numId = parseInt(id, 10);
    
    // Primero verificar si es un producto estático
    if (isStaticProduct(numId)) {
      const staticProduct = findStaticProductById(numId);
      if (staticProduct) {
        return res.status(200).json(staticProduct);
      }
    }
    
    // Si no es estático o no se encontró, buscar en productos dinámicos
    const product = getProductById(numId);
    
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    return res.status(200).json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return res.status(500).json({ error: "Error al obtener el producto" });
  }
} 