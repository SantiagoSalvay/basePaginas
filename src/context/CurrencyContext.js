import { createContext, useState, useContext, useEffect } from 'react';
import { detectUserCurrency } from '../utils/currencyUtils';

// Crear el contexto
const CurrencyContext = createContext();

// Mapeo de divisas a banderas (códigos de país ISO)
export const currencyToFlag = {
  ARS: 'AR', // Argentina
  USD: 'US', // Estados Unidos
  EUR: 'EU', // Unión Europea
  PYG: 'PY', // Paraguay
  BRL: 'BR', // Brasil
};

// Mapeo de divisas a nombres completos
export const currencyToName = {
  ARS: 'Peso Argentino',
  USD: 'Dólar Estadounidense',
  EUR: 'Euro',
  PYG: 'Guaraní Paraguayo',
  BRL: 'Real Brasileño',
};

// Mapeo de divisas a idiomas
export const currencyToLanguage = {
  ARS: 'es', // Español (Argentina)
  USD: 'en', // Inglés
  EUR: 'es', // Español (por defecto para Euro, aunque podría ser cualquier idioma europeo)
  PYG: 'es', // Español (Paraguay)
  BRL: 'pt', // Portugués (Brasil)
};

// Traducciones completas para toda la interfaz
export const translations = {
  es: {
    // Navegación principal
    home: 'Inicio',
    products: 'Productos',
    about: 'Nosotros',
    contact: 'Contacto',
    cart: 'Carrito',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    search: 'Buscar',
    
    // Tema
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    theme: 'Tema',
    
    // Moneda
    currency: 'Moneda',
    selectCurrency: 'Seleccionar Moneda',
    
    // Perfil y cuenta
    profile: 'Mi Perfil',
    adminPanel: 'Panel de Administración',
    myAccount: 'Mi Cuenta',
    myOrders: 'Mis Pedidos',
    settings: 'Configuración',
    favorites: 'Favoritos',
    myWishlist: 'Mis Favoritos',
    viewFullCart: 'Ver carrito completo',
    exploreProducts: 'Explorar productos',
    personalInformation: 'Información Personal',
    changePassword: 'Cambiar Contraseña',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    updatePassword: 'Actualizar Contraseña',
    
    // Productos
    addToCart: 'Agregar al Carrito',
    addToWishlist: 'Agregar a Favoritos',
    removeFromWishlist: 'Quitar de Favoritos',
    outOfStock: 'Agotado',
    inStock: 'Disponible',
    sizes: 'Talles',
    colors: 'Colores',
    price: 'Precio',
    category: 'Categoría',
    rating: 'Valoración',
    reviews: 'Reseñas',
    description: 'Descripción',
    specifications: 'Especificaciones',
    relatedProducts: 'Productos Relacionados',
    
    // Categorías de productos
    clothing: 'Ropa',
    shoes: 'Calzado',
    accessories: 'Accesorios',
    newArrivals: 'Novedades',
    sale: 'Ofertas',
    
    // Carrito y checkout
    checkout: 'Finalizar Compra',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    tax: 'Impuestos',
    total: 'Total',
    proceedToCheckout: 'Proceder al Pago',
    continueShopping: 'Seguir Comprando',
    emptyCart: 'Tu carrito está vacío',
    clearCart: 'Vaciar carrito',
    remove: 'Eliminar',
    item: 'artículo',
    items: 'artículos',
    product: 'Producto',
    quantity: 'Cantidad',
    size: 'Talla',
    orderSummary: 'Resumen del pedido',
    processing: 'Procesando...',
    
    // Formularios
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    address: 'Dirección',
    city: 'Ciudad',
    state: 'Provincia',
    zipCode: 'Código Postal',
    country: 'País',
    phoneNumber: 'Teléfono',
    submit: 'Enviar',
    cancel: 'Cancelar',
    
    // Mensajes
    welcome: 'Bienvenido a ModaVista',
    loginRequired: 'Debes iniciar sesión para continuar',
    successMessage: 'Operación completada con éxito',
    errorMessage: 'Ha ocurrido un error',
    
    // Pie de página
    termsAndConditions: 'Términos y Condiciones',
    privacyPolicy: 'Política de Privacidad',
    faq: 'Preguntas Frecuentes',
    contactUs: 'Contáctanos',
    followUs: 'Síguenos',
    newsletter: 'Suscríbete a nuestro boletín',
    copyright: 'Todos los derechos reservados',
    
    // Fechas y tiempo
    today: 'Hoy',
    yesterday: 'Ayer',
    days: 'días',
    hours: 'horas',
    minutes: 'minutos',
    seconds: 'segundos',
    removedFromWishlist: 'Eliminado de Favoritos',
  },
  
  en: {
    // Main Navigation
    home: 'Home',
    products: 'Products',
    about: 'About Us',
    contact: 'Contact',
    cart: 'Cart',
    login: 'Login',
    logout: 'Logout',
    search: 'Search',
    
    // Theme
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    theme: 'Theme',
    
    // Currency
    currency: 'Currency',
    selectCurrency: 'Select Currency',
    
    // Profile and Account
    profile: 'My Profile',
    adminPanel: 'Admin Panel',
    myAccount: 'My Account',
    myOrders: 'My Orders',
    settings: 'Settings',
    favorites: 'Favorites',
    myWishlist: 'My Wishlist',
    viewFullCart: 'View full cart',
    exploreProducts: 'Explore products',
    personalInformation: 'Personal Information',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    updatePassword: 'Update Password',
    
    // Products
    addToCart: 'Add to Cart',
    addToWishlist: 'Add to Wishlist',
    removeFromWishlist: 'Remove from Wishlist',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    sizes: 'Sizes',
    colors: 'Colors',
    price: 'Price',
    category: 'Category',
    rating: 'Rating',
    reviews: 'Reviews',
    description: 'Description',
    specifications: 'Specifications',
    relatedProducts: 'Related Products',
    
    // Product Categories
    clothing: 'Clothing',
    shoes: 'Shoes',
    accessories: 'Accessories',
    newArrivals: 'New Arrivals',
    sale: 'Sale',
    
    // Cart and Checkout
    checkout: 'Checkout',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax',
    total: 'Total',
    proceedToCheckout: 'Proceed to Checkout',
    continueShopping: 'Continue Shopping',
    emptyCart: 'Your cart is empty',
    clearCart: 'Clear cart',
    remove: 'Remove',
    item: 'item',
    items: 'items',
    product: 'Product',
    quantity: 'Quantity',
    size: 'Size',
    orderSummary: 'Order Summary',
    processing: 'Processing...',
    
    // Forms
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    address: 'Address',
    city: 'City',
    state: 'State',
    zipCode: 'Zip Code',
    country: 'Country',
    phoneNumber: 'Phone Number',
    submit: 'Submit',
    cancel: 'Cancel',
    
    // Messages
    welcome: 'Welcome to ModaVista',
    loginRequired: 'You must be logged in to continue',
    successMessage: 'Operation completed successfully',
    errorMessage: 'An error has occurred',
    
    // Footer
    termsAndConditions: 'Terms and Conditions',
    privacyPolicy: 'Privacy Policy',
    faq: 'FAQ',
    contactUs: 'Contact Us',
    followUs: 'Follow Us',
    newsletter: 'Subscribe to our newsletter',
    copyright: 'All rights reserved',
    
    // Dates and Time
    today: 'Today',
    yesterday: 'Yesterday',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
    removedFromWishlist: 'Removed from Wishlist',
  },
  
  pt: {
    // Navegação Principal
    home: 'Início',
    products: 'Produtos',
    about: 'Sobre Nós',
    contact: 'Contato',
    cart: 'Carrinho',
    login: 'Entrar',
    logout: 'Sair',
    search: 'Buscar',
    
    // Tema
    darkMode: 'Modo Escuro',
    lightMode: 'Modo Claro',
    theme: 'Tema',
    
    // Moeda
    currency: 'Moeda',
    selectCurrency: 'Selecionar Moeda',
    
    // Perfil e Conta
    profile: 'Meu Perfil',
    adminPanel: 'Painel de Administração',
    myAccount: 'Minha Conta',
    myOrders: 'Meus Pedidos',
    settings: 'Configurações',
    favorites: 'Favoritos',
    myWishlist: 'Meus Favoritos',
    viewFullCart: 'Ver carrinho completo',
    exploreProducts: 'Explorar produtos',
    personalInformation: 'Informações Pessoais',
    changePassword: 'Alterar Senha',
    currentPassword: 'Senha Atual',
    newPassword: 'Nova Senha',
    updatePassword: 'Atualizar Senha',
    
    // Produtos
    addToCart: 'Adicionar ao Carrinho',
    addToWishlist: 'Adicionar aos Favoritos',
    removeFromWishlist: 'Remover dos Favoritos',
    outOfStock: 'Esgotado',
    inStock: 'Disponível',
    sizes: 'Tamanhos',
    colors: 'Cores',
    price: 'Preço',
    category: 'Categoria',
    rating: 'Avaliação',
    reviews: 'Avaliações',
    description: 'Descrição',
    specifications: 'Especificações',
    relatedProducts: 'Produtos Relacionados',
    
    // Categorias de Produtos
    clothing: 'Roupas',
    shoes: 'Calçados',
    accessories: 'Acessórios',
    newArrivals: 'Novidades',
    sale: 'Promoções',
    
    // Carrinho e Checkout
    checkout: 'Finalizar Compra',
    subtotal: 'Subtotal',
    shipping: 'Envio',
    tax: 'Impostos',
    total: 'Total',
    proceedToCheckout: 'Prosseguir para Pagamento',
    continueShopping: 'Continuar Comprando',
    emptyCart: 'Seu carrinho está vazio',
    clearCart: 'Esvaziar carrinho',
    remove: 'Remover',
    item: 'item',
    items: 'itens',
    product: 'Produto',
    quantity: 'Quantidade',
    size: 'Tamanho',
    orderSummary: 'Resumo do pedido',
    processing: 'Processando...',
    
    // Formulários
    firstName: 'Nome',
    lastName: 'Sobrenome',
    email: 'Email',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    address: 'Endereço',
    city: 'Cidade',
    state: 'Estado',
    zipCode: 'CEP',
    country: 'País',
    phoneNumber: 'Telefone',
    submit: 'Enviar',
    cancel: 'Cancelar',
    
    // Mensagens
    welcome: 'Bem-vindo à ModaVista',
    loginRequired: 'Você precisa estar logado para continuar',
    successMessage: 'Operação concluída com sucesso',
    errorMessage: 'Ocorreu um erro',
    
    // Rodapé
    termsAndConditions: 'Termos e Condições',
    privacyPolicy: 'Política de Privacidade',
    faq: 'Perguntas Frequentes',
    contactUs: 'Fale Conosco',
    followUs: 'Siga-nos',
    newsletter: 'Assine nossa newsletter',
    copyright: 'Todos os direitos reservados',
    
    // Datas e Tempo
    today: 'Hoje',
    yesterday: 'Ontem',
    days: 'dias',
    hours: 'horas',
    minutes: 'minutos',
    seconds: 'segundos',
    removedFromWishlist: 'Removido dos Favoritos',
  },
};

// Proveedor del contexto
export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD'); // Moneda por defecto
  const [language, setLanguage] = useState('en'); // Idioma por defecto
  const [isLoading, setIsLoading] = useState(true);

  // Cargar preferencias guardadas en localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('userCurrency');
    
    if (savedCurrency) {
      setCurrency(savedCurrency);
      // Establecer el idioma basado en la moneda
      setLanguage(currencyToLanguage[savedCurrency] || 'en');
    }
  }, []);

  // Detectar la moneda del usuario basada en su ubicación al cargar el componente
  useEffect(() => {
    const getUserCurrency = async () => {
      // Solo detectar si no hay preferencias guardadas
      if (!localStorage.getItem('userCurrency')) {
        try {
          setIsLoading(true);
          const userCurrency = await detectUserCurrency();
          setCurrency(userCurrency);
          
          // Establecer el idioma basado en la moneda detectada
          setLanguage(currencyToLanguage[userCurrency] || 'en');
          
          // Guardar preferencias detectadas
          localStorage.setItem('userCurrency', userCurrency);
        } catch (error) {
          console.error("Error al detectar la moneda del usuario:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    getUserCurrency();
  }, []);

  // Función para cambiar la moneda
  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    // Cambiar automáticamente el idioma al correspondiente de la moneda
    setLanguage(currencyToLanguage[newCurrency] || 'en');
    // Guardar preferencia en localStorage
    localStorage.setItem('userCurrency', newCurrency);
  };

  // Función para obtener la traducción
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        language,
        isLoading,
        changeCurrency,
        t,
        currencyToFlag,
        currencyToName,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency debe ser usado dentro de un CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
