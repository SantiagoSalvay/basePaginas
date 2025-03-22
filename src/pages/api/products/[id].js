import { getProductById } from "../../../utils/productStore";
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

export default async function handler(req, res) {
  // Inicializar datos si no se ha hecho
  if (!isInitialized) {
    initServerData();
    isInitialized = true;
    console.log("[API] Datos del servidor inicializados");
  }

  // Solo permitir peticiones GET
  if (req.method !== "GET") {
    console.log(`Método no soportado: ${req.method}`);
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      console.log("ID de producto no proporcionado");
      return res.status(400).json({ error: "ID de producto no proporcionado" });
    }

    console.log(`Buscando producto con ID: ${id}`);
    const numId = parseInt(id, 10);
    
    // Verificar siempre primero si existe una versión dinámica con descuento
    // independientemente de si es un producto estático o no
    const dynamicProduct = getProductById(numId);
    console.log(`¿Existe versión dinámica?: ${!!dynamicProduct}`);
    
    // Si existe una versión dinámica con descuento activo, devolverla directamente
    if (dynamicProduct && dynamicProduct.discount && dynamicProduct.discount.active) {
      console.log(`Producto dinámico encontrado con descuento activo:`);
      console.log(`- Precio original: ${dynamicProduct.originalPrice}`);
      console.log(`- Precio con descuento: ${dynamicProduct.price}`);
      console.log(`- Descuento: ${dynamicProduct.discount.percentage}%`);
      
      // Asegurarse de que el producto tenga todos los campos necesarios
      const completeProduct = {
        ...dynamicProduct,
        // Formatear el precio para evitar errores de redondeo
        price: parseFloat(dynamicProduct.price.toFixed(2)),
        // Si hay precio original, formatearlo también
        originalPrice: dynamicProduct.originalPrice 
          ? parseFloat(dynamicProduct.originalPrice.toFixed(2)) 
          : undefined
      };
      
      return res.status(200).json(completeProduct);
    }
    
    // Verificar si es un producto estático
    const isStatic = isStaticProduct(numId);
    console.log(`¿Es producto estático?: ${isStatic}`);
    
    if (isStatic) {
      // Si es un producto estático, buscarlo en el catálogo estático
      const staticProduct = findStaticProductById(numId);
      
      if (!staticProduct) {
        console.log(`Producto estático con ID ${id} no encontrado`);
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      
      // Si hay una versión dinámica pero sin descuento activo, combinar igual con preferencia a los datos estáticos
      if (dynamicProduct) {
        console.log("Existe versión dinámica pero sin descuento activo, combinando datos");
        
        // Conservar datos estáticos pero permitir actualización de otros campos si existen
        const combinedProduct = {
          ...staticProduct,
          ...dynamicProduct,
          name: staticProduct.name, // Preferir nombre estático
          description: staticProduct.description, // Preferir descripción estática
          image: staticProduct.image, // Preferir imagen estática
          // Asegurarse de que el objeto discount exista
          discount: dynamicProduct.discount || { active: false, percentage: 0 }
        };
        
        return res.status(200).json(combinedProduct);
      }
      
      // Si no hay versión dinámica, devolver el producto estático original
      console.log("No existe versión dinámica, usando datos del producto estático");
      
      // Asegurarse de que el objeto discount siempre exista para evitar errores en el cliente
      const productWithDiscount = {
        ...staticProduct,
        // Asegurarse de que el precio esté formateado correctamente
        price: parseFloat(staticProduct.price.toFixed(2)),
        discount: { active: false, percentage: 0 }
      };
      
      return res.status(200).json(productWithDiscount);
    } else {
      // Si no es un producto estático y no se encontró versión dinámica previamente
      if (!dynamicProduct) {
        console.log(`Producto con ID ${id} no encontrado`);
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      
      // Asegurarse de que el objeto discount siempre exista para evitar errores en el cliente
      if (!dynamicProduct.discount) {
        dynamicProduct.discount = { active: false, percentage: 0 };
      }
      
      // Formatear precio para evitar problemas de redondeo
      const formattedProduct = {
        ...dynamicProduct,
        price: parseFloat(dynamicProduct.price.toFixed(2)),
        originalPrice: dynamicProduct.originalPrice 
          ? parseFloat(dynamicProduct.originalPrice.toFixed(2)) 
          : undefined
      };
      
      console.log(`Devolviendo producto dinámico:`);
      console.log(JSON.stringify(formattedProduct, null, 2));
      return res.status(200).json(formattedProduct);
    }
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return res.status(500).json({ error: "Error al obtener el producto" });
  }
} 