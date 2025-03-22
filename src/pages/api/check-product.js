import { getProductById } from "../../utils/productStore";
import { staticProducts } from "../../utils/staticProducts";

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
      return {...product, category};
    }
  }
  
  return null;
};

export default function handler(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: "ID de producto no proporcionado" });
    }
    
    const numId = parseInt(id, 10);
    
    // Verificar si es un producto estático
    const isStatic = isStaticProduct(numId);
    
    // Obtener el producto del almacén dinámico
    const dynamicProduct = getProductById(numId);
    
    // Obtener el producto estático si corresponde
    const staticProduct = isStatic ? findStaticProductById(numId) : null;
    
    // Verificar si tiene descuento
    const hasDiscount = dynamicProduct && dynamicProduct.discount && dynamicProduct.discount.active;
    
    // Crear objeto de respuesta
    const response = {
      productId: numId,
      isStaticProduct: isStatic,
      hasStaticVersion: !!staticProduct,
      hasDynamicVersion: !!dynamicProduct,
      hasDiscount: hasDiscount,
      staticProduct: staticProduct,
      dynamicProduct: dynamicProduct,
    };
    
    // Si hay ambas versiones, mostrar cómo se combinarían
    if (staticProduct && dynamicProduct) {
      response.combinedProduct = {
        ...staticProduct,
        price: dynamicProduct.price,
        originalPrice: dynamicProduct.originalPrice,
        discount: dynamicProduct.discount
      };
    }
    
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error al verificar producto:", error);
    return res.status(500).json({ error: "Error al verificar el producto" });
  }
} 