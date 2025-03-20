import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  
  // Cargar el carrito desde localStorage cuando se monta el componente
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
        updateCartCount(parsedCart);
        updateCartTotal(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
      }
    }
  }, []);
  
  // Actualizar localStorage cuando cambia el carrito
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cartItems');
    }
  }, [cartItems]);
  
  // Actualizar el conteo del carrito
  const updateCartCount = (items) => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  };
  
  // Actualizar el total del carrito
  const updateCartTotal = (items) => {
    const total = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    setCartTotal(total);
  };
  
  // Añadir un producto al carrito
  const addToCart = (product, quantity = 1, size = null) => {
    setCartItems(prevItems => {
      // Comprobar si el producto ya está en el carrito
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && (size ? item.size === size : true)
      );
      
      let newItems = [...prevItems];
      
      if (existingItemIndex >= 0) {
        // Si el producto ya está en el carrito, aumentar la cantidad
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        };
      } else {
        // Si el producto no está en el carrito, añadirlo
        newItems.push({
          ...product,
          quantity,
          size
        });
      }
      
      updateCartCount(newItems);
      updateCartTotal(newItems);
      
      // Mostrar notificación del total
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);
      
      return newItems;
    });
    
    return true; // Indica que la operación fue exitosa
  };
  
  // Eliminar un producto del carrito
  const removeFromCart = (productId, size = null) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(
        item => !(item.id === productId && (size ? item.size === size : true))
      );
      
      updateCartCount(newItems);
      updateCartTotal(newItems);
      
      if (newItems.length > 0) {
        // Mostrar notificación del total actualizado
        setShowCartNotification(true);
        setTimeout(() => setShowCartNotification(false), 3000);
      }
      
      return newItems;
    });
  };
  
  // Actualizar la cantidad de un producto en el carrito
  const updateQuantity = (productId, quantity, size = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    
    setCartItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.id === productId && (size ? item.size === size : true)) {
          return { ...item, quantity };
        }
        return item;
      });
      
      updateCartCount(newItems);
      updateCartTotal(newItems);
      
      // Mostrar notificación del total actualizado
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);
      
      return newItems;
    });
  };
  
  // Vaciar el carrito
  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    setCartTotal(0);
    localStorage.removeItem('cartItems');
  };
  
  // Calcular el subtotal del carrito
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        showCartNotification,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
}; 