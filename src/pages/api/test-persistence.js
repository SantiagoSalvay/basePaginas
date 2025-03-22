import { getAllProducts } from "../../utils/productStore";
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // Verificar si el archivo de datos existe
    const dataFilePath = path.join(process.cwd(), 'data', 'products.json');
    const fileExists = fs.existsSync(dataFilePath);
    let fileContents = null;
    
    if (fileExists) {
      try {
        fileContents = fs.readFileSync(dataFilePath, 'utf8');
      } catch (error) {
        console.error('Error al leer el archivo de datos:', error);
      }
    }
    
    // Obtener todos los productos del almacén
    const allProducts = getAllProducts();
    
    // Encontrar productos con descuentos activos
    const productsWithDiscounts = [];
    
    for (const category in allProducts) {
      for (const product of allProducts[category]) {
        if (product.discount && product.discount.active) {
          productsWithDiscounts.push({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            category
          });
        }
      }
    }
    
    return res.status(200).json({
      dataFilePath,
      fileExists,
      totalProducts: Object.values(allProducts).flat().length,
      productsWithDiscounts,
      fileSize: fileContents ? fileContents.length : null,
      filePreview: fileContents ? (fileContents.length > 1000 ? fileContents.substring(0, 1000) + '...' : fileContents) : null
    });
  } catch (error) {
    console.error('Error en test de persistencia:', error);
    return res.status(500).json({ error: 'Error al verificar persistencia' });
  }
} 