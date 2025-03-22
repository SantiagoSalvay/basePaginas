import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { addProduct, getAllProducts, removeProduct, updateProduct, customIdExists } from "../../../utils/productStore";
import { staticProducts } from "../../../utils/staticProducts";

// Importar función de inicialización
import { initServerData } from "../../../utils/initServerData";

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

// Variable para controlar la inicialización
let isInitialized = false;

export default async function handler(req, res) {
  // Inicializar datos si no se ha hecho
  if (!isInitialized) {
    initServerData();
    isInitialized = true;
    console.log("[API] Datos del servidor inicializados");
  }

  const session = await getServerSession(req, res, authOptions);

  // GET - Obtener todos los productos
  if (req.method === "GET") {
    const dynamicProducts = getAllProducts();
    
    // Combinar productos estáticos con productos dinámicos
    const combinedProducts = {};
    
    // Primero, añadir todas las categorías de productos estáticos
    Object.keys(staticProducts).forEach(category => {
      // Hacer una copia profunda para evitar modificar los originales
      combinedProducts[category] = [...staticProducts[category]].map(product => ({...product}));
    });
    
    // Luego, añadir productos dinámicos, combinando con los estáticos si la categoría ya existe
    Object.keys(dynamicProducts).forEach(category => {
      if (combinedProducts[category]) {
        // Para cada producto dinámico, verificar si es una versión modificada de un producto estático
        dynamicProducts[category].forEach(dynamicProduct => {
          const isStatic = isStaticProduct(dynamicProduct.id);
          
          if (isStatic) {
            // Es un producto estático modificado, actualizar la versión en combinedProducts
            const index = combinedProducts[category].findIndex(p => p.id === dynamicProduct.id);
            if (index !== -1) {
              // Comprobar si tiene descuento
              const hasDiscount = dynamicProduct.discount && dynamicProduct.discount.active && dynamicProduct.originalPrice;
              
              // Actualizar solo los campos de descuento relevantes
              combinedProducts[category][index] = {
                ...combinedProducts[category][index],
                price: dynamicProduct.price,
                originalPrice: dynamicProduct.originalPrice,
                discount: dynamicProduct.discount
              };
              
              // Log detallado para productos estáticos con descuento
              if (hasDiscount) {
                console.log(`📊 [API] Producto estático con descuento fusionado: ID ${dynamicProduct.id} - ${dynamicProduct.name} - ${dynamicProduct.discount.percentage}% - Precio original: ${dynamicProduct.originalPrice} - Precio con descuento: ${dynamicProduct.price}`);
              }
            }
          } else {
            // No es un producto estático, simplemente añadirlo
            combinedProducts[category].push(dynamicProduct);
          }
        });
      } else {
        // Si la categoría no existe, simplemente añadir todos los productos dinámicos
        combinedProducts[category] = [...dynamicProducts[category]];
      }
    });
    
    // Código de depuración - Contar productos con descuentos
    let totalProducts = 0;
    let productsWithDiscount = 0;
    let discountSample = [];
    let productsByCategory = {};
    
    Object.keys(combinedProducts).forEach(category => {
      const categoryProducts = combinedProducts[category];
      totalProducts += categoryProducts.length;
      productsByCategory[category] = categoryProducts.length;
      
      categoryProducts.forEach(product => {
        if (product.discount && product.discount.active && product.originalPrice) {
          productsWithDiscount++;
          
          // Guardar una muestra de hasta 5 productos con descuento para depuración
          if (discountSample.length < 5) {
            discountSample.push({
              id: product.id,
              name: product.name,
              category,
              price: product.price,
              originalPrice: product.originalPrice,
              discount: product.discount,
              isStatic: isStaticProduct(product.id)
            });
          }
        }
      });
    });
    
    console.log(`[API] Total productos: ${totalProducts}, Por categoría:`, productsByCategory);
    console.log(`[API] Productos con descuento: ${productsWithDiscount} (${Math.round(productsWithDiscount/totalProducts*100)}%)`);
    if (discountSample.length > 0) {
      console.log("[API] Muestra de productos con descuento:");
      discountSample.forEach(p => {
        console.log(`   - ${p.id} - ${p.name} (${p.category}) - Precio: ${p.price} (Original: ${p.originalPrice}) - Descuento: ${p.discount.percentage}% - ${p.isStatic ? 'Estático' : 'Dinámico'}`);
      });
    }
    
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
      
      // Validar que tenga al menos un talle
      if (!product.sizes || !Array.isArray(product.sizes) || product.sizes.length === 0) {
        return res.status(400).json({ error: "El producto debe tener al menos un talle" });
      }
      
      // Validar ID personalizado si se proporciona
      if (product.customId) {
        if (product.customId.length !== 4 || !/^\d{4}$/.test(product.customId)) {
          return res.status(400).json({ error: "El ID personalizado debe ser numérico y tener exactamente 4 dígitos" });
        }
        
        const customId = parseInt(product.customId, 10);
        
        // Verificar si el ID personalizado ya existe
        if (customIdExists(customId)) {
          return res.status(400).json({ error: `El ID ${customId} ya está en uso. Por favor, elija otro ID.` });
        }
        
        // Verificar si el ID personalizado entra en conflicto con productos estáticos
        if (isStaticProduct(customId)) {
          return res.status(400).json({ error: `El ID ${customId} está reservado para productos estáticos. Por favor, elija otro ID.` });
        }
      }
      
      // Forzar la moneda a ARS
      product.currency = "ARS";

      const newProduct = addProduct(product);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error al crear producto:", error);
      return res.status(500).json({ error: error.message || "Error al crear el producto" });
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
      
      // Validar que tenga al menos un talle
      if (!product.sizes || !Array.isArray(product.sizes) || product.sizes.length === 0) {
        return res.status(400).json({ error: "El producto debe tener al menos un talle" });
      }
      
      // Validar moneda
      const validCurrencies = ["ARS", "USD", "EUR", "PYG", "BRL"];
      if (!product.currency || !validCurrencies.includes(product.currency)) {
        return res.status(400).json({ error: "Moneda no válida" });
      }

      // Verificar si es un producto estático
      const isStatic = isStaticProduct(product.id);
      
      if (isStatic) {
        // Para productos estáticos, permitimos solo cambios relacionados con descuentos
        // Buscamos el producto estático original
        let staticProduct = null;
        
        // Buscar el producto en todas las categorías de productos estáticos
        for (const category in staticProducts) {
          const found = staticProducts[category].find(p => p.id === product.id);
          if (found) {
            staticProduct = found;
            break;
          }
        }
        
        if (!staticProduct) {
          return res.status(404).json({ error: "Producto estático no encontrado" });
        }
        
        // Creamos una copia del producto estático con la información de descuento
        const updatedStaticProduct = {
          ...staticProduct,
          originalPrice: product.originalPrice || staticProduct.price,
          price: product.price,
          discount: product.discount
        };
        
        // Información de depuración para descuentos
        if (product.discount && product.discount.active) {
          console.log(`[API] Aplicando descuento de ${product.discount.percentage}% al producto estático ${product.id} - ${product.name}`);
          console.log(`[API] Precio original: ${updatedStaticProduct.originalPrice}, Precio con descuento: ${updatedStaticProduct.price}`);
        } else if (product.originalPrice) {
          console.log(`[API] Eliminando descuento del producto estático ${product.id} - ${product.name}`);
        }
        
        // Almacenar el producto actualizado en algún lugar temporal o caché
        // ya que los productos estáticos no se pueden modificar permanentemente
        // En este caso, podemos usar el mismo updateProduct si maneja productos estáticos adecuadamente
        const updatedProduct = updateProduct(updatedStaticProduct);
        return res.status(200).json(updatedProduct);
      } else {
        // Para productos no estáticos, proceder con la actualización normal
        const updatedProduct = updateProduct(product);
        return res.status(200).json(updatedProduct);
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return res.status(500).json({ error: "Error al actualizar el producto" });
    }
  }

  // Método no permitido
  return res.status(405).json({ error: "Método no permitido" });
}
