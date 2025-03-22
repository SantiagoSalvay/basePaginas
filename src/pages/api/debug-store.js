import { getAllProducts } from "../../utils/productStore";

export default function handler(req, res) {
  // Este endpoint es solo para depuración
  if (req.method === "GET") {
    const products = getAllProducts();
    
    // Contar productos estáticos modificados (1001-5999)
    const staticRange = (id) => 
      (id >= 1001 && id <= 1999) || 
      (id >= 2001 && id <= 2999) || 
      (id >= 3001 && id <= 3999) || 
      (id >= 4001 && id <= 4999) || 
      (id >= 5001 && id <= 5999);
    
    let staticModifiedCount = 0;
    let staticModifiedList = [];
    
    Object.keys(products).forEach(category => {
      products[category].forEach(product => {
        if (staticRange(product.id)) {
          staticModifiedCount++;
          staticModifiedList.push({
            id: product.id,
            name: product.name,
            category,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount
          });
        }
      });
    });
    
    return res.status(200).json({
      categories: Object.keys(products),
      totalProducts: Object.values(products).flat().length,
      staticModifiedCount,
      staticModifiedList
    });
  }
  
  return res.status(405).json({ error: "Método no permitido" });
} 