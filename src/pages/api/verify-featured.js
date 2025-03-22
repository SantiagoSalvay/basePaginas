import { getFeaturedProductIds } from '../../utils/featuredProductsStore';
import { getProductById } from '../../utils/productStore';
import { staticProducts } from '../../utils/staticProducts';

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
  try {
    // Intentamos importar la función para obtener productos destacados
    // Si no existe, creamos una alternativa simple
    let featuredIds;
    try {
      featuredIds = getFeaturedProductIds();
    } catch (error) {
      // Si no existe la función, leemos directamente
      const fs = require('fs');
      const path = require('path');
      const featuredProductsPath = path.join(process.cwd(), 'data', 'featured-products.json');
      
      if (fs.existsSync(featuredProductsPath)) {
        featuredIds = JSON.parse(fs.readFileSync(featuredProductsPath, 'utf8'));
      } else {
        featuredIds = [];
      }
    }
    
    // Verifica si hay productos destacados
    if (!featuredIds || featuredIds.length === 0) {
      return res.status(200).json({
        message: "No hay productos destacados",
        featuredProducts: []
      });
    }
    
    // Obtener detalles de cada producto destacado
    const featuredProducts = [];
    
    for (const id of featuredIds) {
      // Intentar obtener la versión dinámica (con posibles descuentos)
      const dynamicProduct = getProductById(id);
      
      // Buscar el producto estático si existe
      const staticProduct = findStaticProductById(id);
      
      // Combinar si hay versiones estática y dinámica
      if (staticProduct && dynamicProduct) {
        featuredProducts.push({
          ...staticProduct,
          price: dynamicProduct.price,
          originalPrice: dynamicProduct.originalPrice,
          discount: dynamicProduct.discount,
          isStatic: true,
          hasDynamicVersion: true
        });
      } 
      // Solo hay versión estática
      else if (staticProduct) {
        featuredProducts.push({
          ...staticProduct,
          isStatic: true,
          hasDynamicVersion: false
        });
      } 
      // Solo hay versión dinámica
      else if (dynamicProduct) {
        featuredProducts.push({
          ...dynamicProduct,
          isStatic: false,
          hasDynamicVersion: true
        });
      }
    }
    
    return res.status(200).json({
      message: `Encontrados ${featuredProducts.length} productos destacados`,
      featuredIds,
      featuredProducts
    });
    
  } catch (error) {
    console.error('Error al verificar productos destacados:', error);
    return res.status(500).json({ 
      error: "Error al verificar productos destacados",
      message: error.message 
    });
  }
} 