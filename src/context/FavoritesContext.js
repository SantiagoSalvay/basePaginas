import { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  
  // Cargar favoritos desde localStorage cuando se monta el componente
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteItems');
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavoriteItems(parsedFavorites);
        updateFavoritesCount(parsedFavorites);
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        setFavoriteItems([]);
        setFavoritesCount(0);
      }
    }
  }, []);
  
  // Actualizar localStorage cuando cambian los favoritos
  useEffect(() => {
    if (favoriteItems.length > 0) {
      localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems));
    } else {
      localStorage.removeItem('favoriteItems');
    }
  }, [favoriteItems]);
  
  // Actualizar el conteo de favoritos
  const updateFavoritesCount = (items) => {
    setFavoritesCount(items.length);
  };
  
  // Añadir un producto a favoritos
  const addToFavorites = (product) => {
    setFavoriteItems(prevItems => {
      // Comprobar si el producto ya está en favoritos
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id
      );
      
      // Si el producto ya está en favoritos, no hacer nada
      if (existingItemIndex >= 0) {
        return prevItems;
      }
      
      // Si el producto no está en favoritos, añadirlo
      const newItems = [...prevItems, product];
      updateFavoritesCount(newItems);
      return newItems;
    });
    
    return true; // Indica que la operación fue exitosa
  };
  
  // Eliminar un producto de favoritos
  const removeFromFavorites = (productId) => {
    setFavoriteItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId);
      updateFavoritesCount(newItems);
      return newItems;
    });
  };
  
  // Verificar si un producto está en favoritos
  const isInFavorites = (productId) => {
    return favoriteItems.some(item => item.id === productId);
  };
  
  // Vaciar favoritos
  const clearFavorites = () => {
    setFavoriteItems([]);
    setFavoritesCount(0);
    localStorage.removeItem('favoriteItems');
  };
  
  return (
    <FavoritesContext.Provider
      value={{
        favoriteItems,
        favoritesCount,
        addToFavorites,
        removeFromFavorites,
        isInFavorites,
        clearFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  return useContext(FavoritesContext);
}; 