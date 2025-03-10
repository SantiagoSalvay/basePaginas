import { initializeStore } from "../../../utils/productStore";

// Productos iniciales
const initialProducts = {
  Camisas: [
    {
      id: 1,
      name: "Camisa Premium",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990",
      category: "Camisas",
    },
    {
      id: 2,
      name: "Camisa Slim Fit",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
      category: "Camisas",
    },
    {
      id: 3,
      name: "Camisa Oxford",
      price: 54.99,
      image: "https://images.unsplash.com/photo-1598961942613-ba897716405b",
      category: "Camisas",
    },
    {
      id: 4,
      name: "Camisa Lino",
      price: 64.99,
      image: "https://images.unsplash.com/photo-1602810316693-3667c854239a",
      category: "Camisas",
    },
    {
      id: 5,
      name: "Camisa Estampada",
      price: 57.99,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
      category: "Camisas",
    },
    {
      id: 6,
      name: "Camisa Casual",
      price: 52.99,
      image: "https://images.unsplash.com/photo-1603252109303-2751441dd157",
      category: "Camisas",
    },
    {
      id: 7,
      name: "Camisa Formal",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0",
      category: "Camisas",
    },
    {
      id: 8,
      name: "Camisa Manga Corta",
      price: 44.99,
      image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8",
      category: "Camisas",
    },
    {
      id: 9,
      name: "Camisa Denim",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e",
      category: "Camisas",
    },
    {
      id: 10,
      name: "Camisa Oversize",
      price: 62.99,
      image: "https://images.unsplash.com/photo-1604695573706-53170668f6a6",
      category: "Camisas",
    },
  ],
  Pantalones: [
    {
      id: 11,
      name: "Jeans Slim Fit",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d",
      category: "Pantalones",
    },
    {
      id: 12,
      name: "Pantalón Chino",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
      category: "Pantalones",
    },
    {
      id: 13,
      name: "Jeans Straight",
      price: 74.99,
      image: "https://images.unsplash.com/photo-1604176424472-17cd740f74e9",
      category: "Pantalones",
    },
    {
      id: 14,
      name: "Pantalón Formal",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80",
      category: "Pantalones",
    },
    {
      id: 15,
      name: "Jeans Skinny",
      price: 72.99,
      image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec",
      category: "Pantalones",
    },
    {
      id: 16,
      name: "Pantalón Jogger",
      price: 64.99,
      image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea",
      category: "Pantalones",
    },
    {
      id: 17,
      name: "Jeans Relaxed",
      price: 77.99,
      image: "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab",
      category: "Pantalones",
    },
    {
      id: 18,
      name: "Pantalón Cargo",
      price: 82.99,
      image: "https://images.unsplash.com/photo-1517438476312-10d79c077509",
      category: "Pantalones",
    },
    {
      id: 19,
      name: "Jeans Bootcut",
      price: 76.99,
      image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f",
      category: "Pantalones",
    },
    {
      id: 20,
      name: "Pantalón Lino",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf",
      category: "Pantalones",
    },
  ],
  Chaquetas: [
    {
      id: 21,
      name: "Chaqueta Urbana",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
      category: "Chaquetas",
    },
    {
      id: 22,
      name: "Chaqueta Denim",
      price: 119.99,
      image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531",
      category: "Chaquetas",
    },
    {
      id: 23,
      name: "Chaqueta Bomber",
      price: 139.99,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5",
      category: "Chaquetas",
    },
    {
      id: 24,
      name: "Chaqueta Piel",
      price: 169.99,
      image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504",
      category: "Chaquetas",
    },
    {
      id: 25,
      name: "Chaqueta Acolchada",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1548126032-079a0fb0099d",
      category: "Chaquetas",
    },
  ],
  Vestidos: [
    {
      id: 26,
      name: "Vestido Elegante",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8",
      category: "Vestidos",
    },
    {
      id: 27,
      name: "Vestido Casual",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1",
      category: "Vestidos",
    },
    {
      id: 28,
      name: "Vestido de Noche",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae",
      category: "Vestidos",
    },
    {
      id: 29,
      name: "Vestido de Verano",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a",
      category: "Vestidos",
    },
    {
      id: 30,
      name: "Vestido Midi",
      price: 84.99,
      image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223",
      category: "Vestidos",
    },
  ],
  Accesorios: [
    {
      id: 31,
      name: "Reloj Clásico",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d",
      category: "Accesorios",
    },
    {
      id: 32,
      name: "Cinturón de Cuero",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
      category: "Accesorios",
    },
    {
      id: 33,
      name: "Gafas de Sol",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
      category: "Accesorios",
    },
    {
      id: 34,
      name: "Bolso Elegante",
      price: 119.99,
      image: "https://images.unsplash.com/photo-1591561954557-26941169b49e",
      category: "Accesorios",
    },
    {
      id: 35,
      name: "Sombrero de Verano",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325",
      category: "Accesorios",
    },
  ],
};

export default function handler(req, res) {
  if (req.method === "GET") {
    // Inicializar el almacén con los productos predefinidos
    initializeStore(initialProducts);
    return res.status(200).json({ message: "Productos inicializados correctamente" });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
