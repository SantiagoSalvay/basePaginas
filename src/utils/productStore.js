// Almacenamiento temporal de productos (en una aplicación real, esto sería una base de datos)
import fs from 'fs';
import path from 'path';

// Ruta al archivo de almacenamiento
const STORE_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');

// Asegurar que el directorio data existe
const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Variable para almacenar productos en memoria
let products = {};

// Cargar productos guardados del archivo
const loadProductsFromFile = () => {
  ensureDirectoryExists();
  
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const data = fs.readFileSync(STORE_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error al cargar productos del archivo:', error);
  }
  
  return {};
};

// Guardar productos al archivo
const saveProductsToFile = () => {
  ensureDirectoryExists();
  
  try {
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(products, null, 2), 'utf8');
    console.log('[Store] Productos guardados en archivo', STORE_FILE_PATH);
  } catch (error) {
    console.error('Error al guardar productos en archivo:', error);
  }
};

// Inicializar con los productos existentes
const initializeStore = (existingProducts) => {
  // Primero intentar cargar del archivo (persistencia)
  const savedProducts = loadProductsFromFile();
  
  if (Object.keys(savedProducts).length > 0) {
    console.log('[Store] Cargando productos guardados del archivo');
    products = savedProducts;
  } else if (existingProducts && Object.keys(existingProducts).length > 0) {
    console.log('[Store] Inicializando con productos proporcionados');
    products = existingProducts;
    // Guardar los productos iniciales al archivo
    saveProductsToFile();
  } else {
    console.log('[Store] Inicializando almacén vacío');
    products = {};
  }
};

// Obtener todos los productos
const getAllProducts = () => {
  return products;
};

// Obtener productos por categoría
const getProductsByCategory = (category) => {
  return products[category] || [];
};

// Obtener un producto por ID
const getProductById = (id) => {
  for (const category in products) {
    const product = products[category].find(p => p.id === id);
    if (product) {
      return product;
    }
  }
  return null;
};

// Verificar si un ID personalizado ya existe
const customIdExists = (customId) => {
  if (!customId) return false;
  
  // Convertir a número para comparación
  const numericId = parseInt(customId, 10);
  
  // Buscar en todas las categorías
  return Object.values(products).flat().some(p => p.id === numericId);
};

// Añadir un nuevo producto
const addProduct = (product) => {
  if (!products[product.category]) {
    products[product.category] = [];
  }
  
  let newId;
  
  // Si se proporciona un ID personalizado de 4 dígitos, usarlo
  if (product.customId && product.customId.length === 4) {
    newId = parseInt(product.customId, 10);
    
    // Verificar si el ID ya existe
    if (customIdExists(newId)) {
      throw new Error(`El ID ${newId} ya está en uso. Por favor, elija otro ID.`);
    }
  } else {
    // Generar un ID único que no entre en conflicto con los productos estáticos
    // Los productos estáticos usan IDs en rangos específicos (1001-1999, 2001-2999, etc.)
    // Usaremos IDs en el rango 10000+ para los productos dinámicos
    newId = Math.max(
      10000, // Empezar desde 10000 para evitar conflictos con productos estáticos
      ...Object.values(products).flat().map(p => p.id || 0)
    ) + 1;
  }
  
  // Eliminar el campo customId antes de guardar
  const { customId, ...productData } = product;
  
  const newProduct = {
    ...productData,
    id: newId
  };
  
  products[product.category].push(newProduct);
  
  // Guardar cambios al archivo
  saveProductsToFile();
  
  return newProduct;
};

// Eliminar un producto
const removeProduct = (id) => {
  for (const category in products) {
    products[category] = products[category].filter(p => p.id !== id);
  }
  
  // Guardar cambios al archivo
  saveProductsToFile();
};

// Actualizar un producto
const updateProduct = (updatedProduct) => {
  // Asegurar que los campos de descuento estén bien formateados
  if (updatedProduct.discount && updatedProduct.discount.active) {
    // Si hay un descuento activo, asegurarse de que originalPrice exista
    if (!updatedProduct.originalPrice) {
      updatedProduct.originalPrice = updatedProduct.price;
    }
    
    // Asegurarse de que el porcentaje de descuento sea un número
    if (typeof updatedProduct.discount.percentage !== 'number') {
      updatedProduct.discount.percentage = parseFloat(updatedProduct.discount.percentage) || 0;
    }
    
    // Verificar que el precio con descuento sea menor que el original
    if (updatedProduct.price >= updatedProduct.originalPrice) {
      const percentage = updatedProduct.discount.percentage;
      updatedProduct.price = updatedProduct.originalPrice * (1 - percentage / 100);
    }
  }
  
  let found = false;
  
  // Buscar el producto en todas las categorías
  for (const category in products) {
    const index = products[category].findIndex(p => p.id === updatedProduct.id);
    
    if (index !== -1) {
      // Si la categoría cambió, eliminar de la categoría actual
      if (category !== updatedProduct.category) {
        products[category].splice(index, 1);
        
        // Asegurarse de que la nueva categoría existe
        if (!products[updatedProduct.category]) {
          products[updatedProduct.category] = [];
        }
        
        // Añadir a la nueva categoría
        products[updatedProduct.category].push(updatedProduct);
      } else {
        // Actualizar en la misma categoría
        products[category][index] = updatedProduct;
      }
      
      found = true;
      break;
    }
  }
  
  // Si no se encontró, podría ser un producto nuevo o un producto estático que estamos modificando
  if (!found) {
    if (!products[updatedProduct.category]) {
      products[updatedProduct.category] = [];
    }
    
    // Verificar si ya existe un producto con el mismo ID en esta categoría
    const existingIndex = products[updatedProduct.category].findIndex(p => p.id === updatedProduct.id);
    
    if (existingIndex !== -1) {
      // Actualizar el producto existente
      products[updatedProduct.category][existingIndex] = updatedProduct;
    } else {
      // Añadir el producto como nuevo
      products[updatedProduct.category].push(updatedProduct);
    }
  }
  
  console.log(`[Store] Producto actualizado: ${updatedProduct.id} - ${updatedProduct.name} ${updatedProduct.discount && updatedProduct.discount.active ? `con ${updatedProduct.discount.percentage}% de descuento` : 'sin descuento'}`);
  
  // Guardar cambios al archivo
  saveProductsToFile();
  
  return updatedProduct;
};

// Cargar los productos al inicio
initializeStore({});

export {
  initializeStore,
  getAllProducts,
  getProductsByCategory,
  addProduct,
  removeProduct,
  updateProduct,
  customIdExists,
  getProductById
};
