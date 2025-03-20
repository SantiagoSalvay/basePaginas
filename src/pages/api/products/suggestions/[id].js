import { getAllProducts, getProductById } from "../../../../utils/productStore";
import { staticProducts } from "../../../../utils/staticProducts";

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

// Obtener todos los productos (estáticos y dinámicos)
const getAllProductsCombined = () => {
  const dynamicProducts = getAllProducts();
  const allProducts = [];
  
  // Añadir productos estáticos
  Object.keys(staticProducts).forEach(category => {
    staticProducts[category].forEach(product => {
      allProducts.push(product);
    });
  });
  
  // Añadir productos dinámicos
  Object.keys(dynamicProducts).forEach(category => {
    dynamicProducts[category].forEach(product => {
      allProducts.push(product);
    });
  });
  
  return allProducts;
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
    
    // Obtener el producto actual para referencias de categoría
    let currentProduct;
    
    // Primero verificar si es un producto estático
    if (isStaticProduct(numId)) {
      currentProduct = findStaticProductById(numId);
    } else {
      // Si no es estático, buscar en productos dinámicos
      currentProduct = getProductById(numId);
    }
    
    if (!currentProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    // Obtener todos los productos
    const allProducts = getAllProductsCombined();
    
    // Filtrar productos de la misma categoría excepto el producto actual
    const sameCategoryProducts = allProducts.filter(
      product => product.category === currentProduct.category && product.id !== numId
    );
    
    // Productos de otras categorías
    const otherCategoryProducts = allProducts.filter(
      product => product.category !== currentProduct.category
    );
    
    // Mezclar los productos de la misma categoría para aleatoriedad
    const shuffledSameCategory = [...sameCategoryProducts].sort(() => 0.5 - Math.random());
    
    // Mezclar los productos de otras categorías para aleatoriedad
    const shuffledOtherCategory = [...otherCategoryProducts].sort(() => 0.5 - Math.random());
    
    // Priorizar productos de la misma categoría pero incluir algunos de otras categorías
    let suggestions = [];
    
    // Añadir primero hasta 6 productos de la misma categoría
    suggestions = shuffledSameCategory.slice(0, 6);
    
    // Completar hasta 10 productos con otras categorías si es necesario
    const remainingSlots = 10 - suggestions.length;
    if (remainingSlots > 0) {
      suggestions = [
        ...suggestions,
        ...shuffledOtherCategory.slice(0, remainingSlots)
      ];
    }
    
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error al obtener sugerencias:", error);
    return res.status(500).json({ error: "Error al obtener las sugerencias de productos" });
  }
} 