import { getAllProducts, updateProduct } from "../../utils/productStore";
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Este endpoint solo permite solicitudes POST y requiere confirmación
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { confirm } = req.body;
    
    if (confirm !== 'RESET_DISCOUNTS') {
      return res.status(400).json({
        error: 'Se requiere confirmación. Incluya "confirm":"RESET_DISCOUNTS" en el cuerpo de la solicitud.'
      });
    }
    
    // Obtener todos los productos
    const allProducts = getAllProducts();
    const modifiedProducts = [];
    
    // Iterar por todas las categorías y productos
    for (const category in allProducts) {
      for (const product of allProducts[category]) {
        // Si el producto tiene descuento activo, eliminarlo
        if (product.discount && product.discount.active) {
          // Crear una copia del producto
          const updatedProduct = { ...product };
          
          // Si tiene precio original, restaurarlo
          if (updatedProduct.originalPrice) {
            updatedProduct.price = updatedProduct.originalPrice;
            delete updatedProduct.originalPrice;
          }
          
          // Desactivar el descuento
          updatedProduct.discount = {
            active: false,
            percentage: 0
          };
          
          // Actualizar el producto en el almacén
          updateProduct(updatedProduct);
          
          modifiedProducts.push({
            id: product.id,
            name: product.name,
            previousDiscount: product.discount.percentage
          });
        }
      }
    }
    
    // También podemos eliminar directamente el archivo de persistencia si es necesario
    /* 
    const dataFilePath = path.join(process.cwd(), 'data', 'products.json');
    if (fs.existsSync(dataFilePath)) {
      fs.unlinkSync(dataFilePath);
    }
    */
    
    return res.status(200).json({
      success: true,
      message: `Se han eliminado los descuentos de ${modifiedProducts.length} productos.`,
      modifiedProducts
    });
  } catch (error) {
    console.error('Error al reiniciar descuentos:', error);
    return res.status(500).json({ error: 'Error al reiniciar los descuentos' });
  }
} 