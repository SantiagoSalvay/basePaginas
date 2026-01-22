import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";

// Componentes
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import AnimatedSection from "../components/AnimatedSection";
import CategoryBar from "../components/CategoryBar";

function Coleccion() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        
        // Código de depuración
        console.log("Datos recibidos del API (colección):", {
          categoriesCount: Object.keys(response.data).length,
          sample: Object.keys(response.data).length > 0 
            ? response.data[Object.keys(response.data)[0]].slice(0, 2).map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                originalPrice: p.originalPrice,
                discount: p.discount,
                hasDiscount: p.discount && p.discount.active
              }))
            : []
        });
        
        // NUEVO: Verificar todos los productos para detectar si hay alguno con descuento
        console.log("🛍️ [Colección] Verificando productos con descuentos:");
        let totalProductsWithDiscount = 0;
        const productsWithDiscount = [];
        
        Object.keys(response.data).forEach(category => {
          response.data[category].forEach(product => {
            if (product.discount && product.discount.active && product.originalPrice) {
              totalProductsWithDiscount++;
              productsWithDiscount.push({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                discount: product.discount.percentage,
                category
              });
            }
          });
        });
        
        console.log(`🛍️ [Colección] Encontrados ${totalProductsWithDiscount} productos con descuento:`);
        productsWithDiscount.forEach(p => {
          console.log(`   - ID ${p.id} - ${p.name} (${p.category}) - Descuento: ${p.discount}%`);
        });
        
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("No se pudieron cargar los productos. Por favor, inténtalo de nuevo más tarde.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Lista de categorías
  const categories = Object.keys(products);

  useEffect(() => {
    setMounted(true);

    // Filtrar productos según la categoría seleccionada
    if (activeCategory === "Todos") {
      const allProducts = [];
      categories.forEach(category => {
        allProducts.push(...(products[category] || []));
      });
      setFilteredProducts(allProducts);
      
      // Depuración: Verificar si hay productos con descuentos
      console.log("Todos los productos:", allProducts.length);
      const withDiscount = allProducts.filter(p => p.discount && p.discount.active && p.originalPrice);
      console.log("Productos con descuentos:", withDiscount.length, withDiscount.map(p => `${p.id} - ${p.name}`));
    } else {
      setFilteredProducts(products[activeCategory] || []);
      
      // Depuración: Verificar si hay productos con descuentos en esta categoría
      const categoryProducts = products[activeCategory] || [];
      console.log(`Productos en categoría ${activeCategory}:`, categoryProducts.length);
      const withDiscount = categoryProducts.filter(p => p.discount && p.discount.active && p.originalPrice);
      console.log(`Productos con descuentos en ${activeCategory}:`, withDiscount.length, withDiscount.map(p => `${p.id} - ${p.name}`));
    }
  }, [activeCategory, products]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <Head>
        <title>Colección | ModaVista</title>
      </Head>

      <Navbar />

      {/* Hero Section */}
      <AnimatedSection animation="scrollFade" className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d"
            alt="Colección ModaVista"
            layout="fill"
            objectFit="cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Nuestra Colección</h1>
          <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto">Explora nuestras prendas exclusivas y encuentra tu estilo único</p>
        </div>
      </AnimatedSection>

      {/* Collection Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="slideUp" className="mb-10">
            <CategoryBar 
              categories={categories} 
              activeCategory={activeCategory} 
              setActiveCategory={setActiveCategory} 
            />
          </AnimatedSection>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">
              <p>{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">No hay productos disponibles en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <AnimatedSection 
                  key={product.id} 
                  animation="slideUp" 
                  delay={index * 0.05}
                  threshold={0.1}
                >
                  <ProductCard product={product} />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Coleccion;

// Deshabilitar SSG para esta página
export async function getServerSideProps() {
  return {
    props: {}
  };
}
