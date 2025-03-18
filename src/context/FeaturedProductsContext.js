import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const FeaturedProductsContext = createContext();

export function FeaturedProductsProvider({ children }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [featuredResponse, productsResponse] = await Promise.all([
        axios.get('/api/featured-products'),
        axios.get('/api/products')
      ]);

      const featuredIds = featuredResponse.data;
      const allProducts = Object.values(productsResponse.data).flat();
      const featured = allProducts.filter(product => featuredIds.includes(product.id));
      
      setFeaturedProducts(featured);
      setError(null);
    } catch (err) {
      console.error('Error loading featured products:', err);
      setError('Error al cargar los productos destacados');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (productId) => {
    try {
      await axios.post('/api/featured-products', { productId });
      await loadFeaturedProducts();
      return true;
    } catch (err) {
      console.error('Error adding product:', err);
      return false;
    }
  }, [loadFeaturedProducts]);

  const removeProduct = useCallback(async (productId) => {
    try {
      const updatedProducts = featuredProducts.filter(p => p.id !== productId);
      setFeaturedProducts(updatedProducts); // Actualización optimista

      await axios.delete('/api/featured-products', { 
        data: { productId }
      });
      
      await loadFeaturedProducts(); // Recargar para asegurar sincronización
      return true;
    } catch (err) {
      console.error('Error removing product:', err);
      await loadFeaturedProducts(); // Recargar en caso de error
      return false;
    }
  }, [featuredProducts, loadFeaturedProducts]);

  return (
    <FeaturedProductsContext.Provider
      value={{
        featuredProducts,
        loading,
        error,
        loadFeaturedProducts,
        addProduct,
        removeProduct
      }}
    >
      {children}
    </FeaturedProductsContext.Provider>
  );
}

export function useFeaturedProducts() {
  const context = useContext(FeaturedProductsContext);
  if (!context) {
    throw new Error('useFeaturedProducts must be used within a FeaturedProductsProvider');
  }
  return context;
}
