// Tasas de conversión (en una aplicación real, estas deberían obtenerse de una API)
export const exchangeRates = {
  ARS: 1,
  USD: 0.0011, // 1 ARS = 0.0011 USD
  EUR: 0.0010, // 1 ARS = 0.0010 EUR
  PYG: 8.20,   // 1 ARS = 8.20 PYG
  BRL: 0.0056  // 1 ARS = 0.0056 BRL
};

// Símbolos de moneda
export const currencySymbols = {
  ARS: "$",
  USD: "US$",
  EUR: "€",
  PYG: "₲",
  BRL: "R$"
};

// Mapeo de códigos de país a monedas
export const countryToCurrency = {
  // América
  AR: "ARS", // Argentina
  US: "USD", // Estados Unidos
  CA: "USD", // Canadá (usando USD para simplificar)
  MX: "USD", // México (usando USD para simplificar)
  BR: "BRL", // Brasil
  PY: "PYG", // Paraguay
  UY: "USD", // Uruguay (usando USD para simplificar)
  CL: "USD", // Chile (usando USD para simplificar)
  PE: "USD", // Perú (usando USD para simplificar)
  CO: "USD", // Colombia (usando USD para simplificar)
  VE: "USD", // Venezuela (usando USD para simplificar)
  EC: "USD", // Ecuador (usando USD para simplificar)
  BO: "USD", // Bolivia (usando USD para simplificar)
  
  // Europa
  ES: "EUR", // España
  FR: "EUR", // Francia
  DE: "EUR", // Alemania
  IT: "EUR", // Italia
  GB: "EUR", // Reino Unido (usando EUR para simplificar)
  PT: "EUR", // Portugal
  NL: "EUR", // Países Bajos
  BE: "EUR", // Bélgica
  
  // Valor por defecto
  DEFAULT: "USD"
};

// Función para convertir precios
export const convertPrice = (basePrice, baseCurrency, targetCurrency) => {
  // Si la moneda base y objetivo son iguales, no hay conversión
  if (baseCurrency === targetCurrency) {
    return basePrice;
  }
  
  // Convertir a ARS primero si la moneda base no es ARS
  let priceInARS = basePrice;
  if (baseCurrency !== "ARS") {
    priceInARS = basePrice / exchangeRates[baseCurrency];
  }
  
  // Convertir de ARS a la moneda objetivo
  return priceInARS * exchangeRates[targetCurrency];
};

// Función para formatear el precio según la moneda
export const formatPrice = (price, currency) => {
  const symbol = currencySymbols[currency];
  
  // Diferentes formatos según la moneda
  switch (currency) {
    case "PYG":
      return `${symbol} ${Math.round(price).toLocaleString()}`; // Sin decimales para Guaraní
    case "ARS":
      return `${symbol} ${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    default:
      return `${symbol} ${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  }
};

// Función para detectar la moneda del usuario basada en su ubicación
export const detectUserCurrency = async () => {
  try {
    // Intentar obtener la ubicación del usuario a través de una API de geolocalización
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    // Obtener el código de país
    const countryCode = data.country_code;
    
    // Mapear el código de país a una moneda
    return countryToCurrency[countryCode] || countryToCurrency.DEFAULT;
  } catch (error) {
    console.error('Error al detectar la moneda del usuario:', error);
    return countryToCurrency.DEFAULT; // Valor por defecto
  }
};
