import fs from 'fs';
import path from 'path';

// Ruta al archivo JSON que almacenará los productos destacados
const featuredProductsPath = path.join(process.cwd(), 'data', 'featured-products.json');

// Función para asegurar que el directorio data existe
const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Función para leer los IDs de productos destacados
export const getFeaturedProductIds = () => {
  ensureDirectoryExists();
  
  if (!fs.existsSync(featuredProductsPath)) {
    // Si el archivo no existe, crear uno vacío
    fs.writeFileSync(featuredProductsPath, JSON.stringify([]));
    return [];
  }
  
  try {
    const data = fs.readFileSync(featuredProductsPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error al leer productos destacados:', err);
    return [];
  }
};

// Función para guardar los IDs de productos destacados
export const saveFeaturedProductIds = (productIds) => {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(featuredProductsPath, JSON.stringify(productIds, null, 2));
    return true;
  } catch (err) {
    console.error('Error al guardar productos destacados:', err);
    return false;
  }
};

// Función para añadir un producto a los destacados
export const addFeaturedProduct = (productId) => {
  const featuredProducts = getFeaturedProductIds();
  
  if (featuredProducts.includes(productId)) {
    return false; // Ya está en la lista
  }
  
  featuredProducts.push(productId);
  return saveFeaturedProductIds(featuredProducts);
};

// Función para eliminar un producto de los destacados
export const removeFeaturedProduct = (productId) => {
  let featuredProducts = getFeaturedProductIds();
  
  if (!featuredProducts.includes(productId)) {
    return false; // No está en la lista
  }
  
  featuredProducts = featuredProducts.filter(id => id !== productId);
  return saveFeaturedProductIds(featuredProducts);
}; 