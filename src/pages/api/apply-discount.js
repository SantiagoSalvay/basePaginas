import { getProductById, updateProduct } from "../../utils/productStore";
import { staticProducts } from "../../utils/staticProducts";

// Función para buscar un producto estático por ID
const findStaticProductById = (id) => {
  const numId = parseInt(id, 10);
  
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
    // Solo permitir métodos POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }
    
    const { id, discount } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID de producto no proporcionado' });
    }
    
    if (!discount || typeof discount.percentage !== 'number') {
      return res.status(400).json({ error: 'Datos de descuento inválidos' });
    }
    
    const numId = parseInt(id, 10);
    
    // Buscar primero en el almacén dinámico
    let product = getProductById(numId);
    
    // Si no existe en el almacén dinámico, buscar en productos estáticos
    if (!product) {
      const staticProduct = findStaticProductById(numId);
      if (staticProduct) {
        // Crear una copia dinámica del producto estático
        product = {
          ...staticProduct,
          originalPrice: staticProduct.price,
          discount: {
            active: true,
            percentage: discount.percentage
          }
        };
        
        // Calcular el precio con descuento y redondear a 2 decimales
        const discountedPrice = staticProduct.price * (1 - discount.percentage / 100);
        product.price = parseFloat(discountedPrice.toFixed(2));
      } else {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
    } else {
      // Si ya existe, actualizar sus datos de descuento
      product.originalPrice = product.originalPrice || product.price;
      product.discount = {
        active: true,
        percentage: discount.percentage
      };
      // Calcular el precio con descuento y redondear a 2 decimales
      const discountedPrice = product.originalPrice * (1 - discount.percentage / 100);
      product.price = parseFloat(discountedPrice.toFixed(2));
    }
    
    // Guardar el producto actualizado en el almacén
    const updatedProduct = updateProduct(product);
    
    console.log(`Descuento aplicado al producto ${id}:`, {
      nombre: updatedProduct.name,
      precioOriginal: updatedProduct.originalPrice,
      precioConDescuento: updatedProduct.price,
      descuento: updatedProduct.discount
    });
    
    return res.status(200).json({
      success: true,
      message: `Descuento del ${discount.percentage}% aplicado al producto ${product.name}`,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error al aplicar descuento:', error);
    return res.status(500).json({ error: 'Error al aplicar el descuento' });
  }
} 