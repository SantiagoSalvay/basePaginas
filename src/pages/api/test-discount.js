import { updateProduct } from "../../utils/productStore";
import { staticProducts } from "../../utils/staticProducts";

export default async function handler(req, res) {
  // Este endpoint es solo para pruebas
  if (req.method === "GET") {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: "Se requiere un ID de producto" });
      }
      
      const numId = parseInt(id, 10);
      
      // Buscar el producto estático
      let staticProduct = null;
      let categoryName = "";
      
      // Buscar en todas las categorías de productos estáticos
      for (const category in staticProducts) {
        const found = staticProducts[category].find(p => p.id === numId);
        if (found) {
          staticProduct = found;
          categoryName = category;
          break;
        }
      }
      
      if (!staticProduct) {
        return res.status(404).json({ error: "Producto estático no encontrado" });
      }
      
      // Aplicar un descuento de prueba del 20%
      const discountPercentage = 20;
      const originalPrice = staticProduct.price;
      const discountedPrice = originalPrice * (1 - discountPercentage / 100);
      
      // Crear el producto con descuento
      const productWithDiscount = {
        ...staticProduct,
        originalPrice: originalPrice,
        price: discountedPrice,
        discount: {
          active: true,
          percentage: discountPercentage
        }
      };
      
      // Actualizar el producto en el almacenamiento dinámico
      const updatedProduct = updateProduct(productWithDiscount);
      
      return res.status(200).json({
        message: `Descuento del ${discountPercentage}% aplicado al producto ${numId}`,
        product: updatedProduct
      });
    } catch (error) {
      console.error("Error al aplicar descuento:", error);
      return res.status(500).json({ error: "Error al aplicar el descuento" });
    }
  }
  
  return res.status(405).json({ error: "Método no permitido" });
} 