// Almacenamiento temporal de productos (en una aplicación real, esto sería una base de datos)
let products = {};

// Inicializar con los productos existentes
const initializeStore = (existingProducts) => {
  if (existingProducts) {
    products = existingProducts;
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

// Añadir un nuevo producto
const addProduct = (product) => {
  if (!products[product.category]) {
    products[product.category] = [];
  }
  
  // Generar un ID único que no entre en conflicto con los productos estáticos
  // Los productos estáticos usan IDs en rangos específicos (1001-1999, 2001-2999, etc.)
  // Usaremos IDs en el rango 10000+ para los productos dinámicos
  const newId = Math.max(
    10000, // Empezar desde 10000 para evitar conflictos con productos estáticos
    ...Object.values(products).flat().map(p => p.id || 0)
  ) + 1;
  
  const newProduct = {
    ...product,
    id: newId
  };
  
  products[product.category].push(newProduct);
  return newProduct;
};

// Eliminar un producto
const removeProduct = (id) => {
  for (const category in products) {
    products[category] = products[category].filter(p => p.id !== id);
  }
};

// Actualizar un producto
const updateProduct = (updatedProduct) => {
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
  
  // Si no se encontró, podría ser un producto nuevo
  if (!found) {
    if (!products[updatedProduct.category]) {
      products[updatedProduct.category] = [];
    }
    products[updatedProduct.category].push(updatedProduct);
  }
  
  return updatedProduct;
};

export {
  initializeStore,
  getAllProducts,
  getProductsByCategory,
  addProduct,
  removeProduct,
  updateProduct
};
