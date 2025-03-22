import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { FaGoogle, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import PageTransition from "../components/PageTransition";

// Componentes
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import TestimonialCarousel from "../components/TestimonialCarousel";
import ContactForm from "../components/ContactForm";
import AnimatedSection from "../components/AnimatedSection";

export default function Home() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMounted(true);
    
    // Cargar productos desde la API
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Obtener productos destacados de la API
        const featuredResponse = await axios.get('/api/featured-products');
        const featuredIds = featuredResponse.data;
        
        // Si no hay productos destacados, seleccionar algunos aleatorios
        if (featuredIds.length === 0) {
          const response = await axios.get('/api/products');
          
          // Obtener productos aleatorios de diferentes categorías
          const allProducts = [];
          Object.keys(response.data).forEach(category => {
            if (response.data[category] && response.data[category].length > 0) {
              allProducts.push(...response.data[category]);
            }
          });
          
          // Seleccionar aleatoriamente hasta 8 productos
          const randomProducts = [];
          const totalProducts = allProducts.length;
          
          if (totalProducts > 0) {
            const maxProducts = Math.min(8, totalProducts);
            const selectedIndices = new Set();
            
            while (selectedIndices.size < maxProducts) {
              const randomIndex = Math.floor(Math.random() * totalProducts);
              selectedIndices.add(randomIndex);
            }
            
            selectedIndices.forEach(index => {
              randomProducts.push(allProducts[index]);
            });
          }
          
          setFeaturedProducts(randomProducts);
        } else {
          // Hay productos destacados, obtener sus detalles
          const productsResponse = await axios.get('/api/products');
          const allProducts = [];
          
          Object.keys(productsResponse.data).forEach(category => {
            allProducts.push(...productsResponse.data[category]);
          });
          
          // Filtrar los productos destacados
          const featured = allProducts.filter(product => featuredIds.includes(product.id));
          
          // MODIFICACIÓN: asegurarse de que solo se muestren descuentos explícitamente activos
          const featuredWithoutForcedDiscounts = featured.map(product => {
            // Si el producto no tiene descuento activo explícito, eliminar cualquier información de descuento
            if (!product.discount || !product.discount.active) {
              // Crear una copia sin información de descuento
              const { discount, originalPrice, ...productWithoutDiscount } = product;
              return productWithoutDiscount;
            }
            
            // Si tiene descuento activo, mantenerlo tal cual
            return product;
          });
          
          // Establecer los productos destacados filtrados
          setFeaturedProducts(featuredWithoutForcedDiscounts);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar productos destacados:", err);
        setError("No se pudieron cargar los productos destacados");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (!mounted) return null;

  const testimonials = [
    {
      id: 1,
      name: "Laura Martínez",
      role: "Diseñadora de Moda",
      content: "La calidad de las prendas es excepcional. Cada detalle está cuidado al máximo.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      role: "Influencer",
      content: "ModaVista ha revolucionado mi armario. Diseños únicos que marcan tendencia.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    },
    {
      id: 3,
      name: "Elena Gómez",
      role: "Estilista",
      content: "Trabajar con sus prendas es un placer. Versatilidad y estilo en cada colección.",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Head>
          <title>ModaVista | Moda Exclusiva</title>
        </Head>

        <Navbar />

        {/* Hero Section */}
        <AnimatedSection animation="scrollFade" className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b"
              alt="ModaVista Hero"
              layout="fill"
              objectFit="cover"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>

          <div className="container mx-auto px-4 z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">Redefine Tu Estilo</h1>
            <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto">Diseños exclusivos que transforman tu imagen y elevan tu presencia</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/coleccion">
                <button className="hero-button primary-button">Explorar Colección</button>
              </Link>
              <Link href="/nosotros">
                <button className="hero-button bg-transparent text-white border border-white hover:bg-white hover:text-black">Nuestra Historia</button>
              </Link>
            </div>
          </div>
        </AnimatedSection>

        {/* Featured Products */}
        <AnimatedSection animation="scrollSlide" className="py-6 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="section-title dark:text-white">Colección Destacada</h2>
              <p className="section-subtitle">Descubre nuestras piezas más exclusivas, diseñadas para marcar tendencia</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-10">
                <p>{error}</p>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600 dark:text-gray-400">No hay productos destacados disponibles en este momento.</p>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div 
                  className="flex gap-8 animate-carousel hover:pause-animation"
                  style={{
                    width: `${featuredProducts.length * 3 * 320}px`
                  }}
                >
                  {/* Triplicamos los productos para crear un efecto de loop infinito sin saltos */}
                  {[...featuredProducts, ...featuredProducts, ...featuredProducts].map((product, index) => (
                    <div 
                      key={`${product.id}-${index}`} 
                      className="w-[300px] flex-shrink-0 carousel-item"
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement.style.animationPlayState = 'paused';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement.style.animationPlayState = 'running';
                      }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <AnimatedSection animation="slideUp" delay={0.4} className="text-center mt-16">
              <Link href="/coleccion">
                <button className="hero-button primary-button">Ver Colección Completa</button>
              </Link>
            </AnimatedSection>
          </div>
        </AnimatedSection>

        {/* About Section */}
        <AnimatedSection animation="scrollScale" className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <AnimatedSection animation="slideRight" className="lg:w-1/2" threshold={0.3}>
                <div className="relative h-[600px] rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1551232864-3f0890e580d9"
                    alt="Nuestra Historia"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-2xl"
                  />
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slideLeft" className="lg:w-1/2" threshold={0.3} delay={0.2}>
                <h2 className="section-title dark:text-white">Nuestra Historia</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">ModaVista nació de la pasión por el diseño y la moda sostenible. Fundada en 2020 por un grupo de diseñadores visionarios, nuestra misión es crear prendas que combinen estilo, calidad y responsabilidad.</p>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Cada colección es el resultado de un meticuloso proceso creativo, donde la innovación y la tradición se encuentran para dar vida a diseños únicos que reflejan la personalidad de quienes los visten.</p>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-10">Trabajamos con materiales de primera calidad y procesos de producción éticos, garantizando que cada prenda no solo luzca excepcional, sino que también respete nuestro compromiso con el planeta y las comunidades.</p>
                <Link href="/nosotros">
                  <button className="hero-button primary-button">Conoce Más</button>
                </Link>
              </AnimatedSection>
            </div>
          </div>
        </AnimatedSection>

        {/* Testimonials */}
        <AnimatedSection animation="scrollAll" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="section-title dark:text-white">Lo Que Dicen Nuestros Clientes</h2>
              <p className="section-subtitle">Experiencias reales de quienes han confiado en nuestra marca</p>
            </div>

            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </AnimatedSection>

        {/* Contact Form */}
        <AnimatedSection animation="scrollFade" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="section-title dark:text-white">Contacta Con Nosotros</h2>
                <p className="section-subtitle">¿Tienes alguna pregunta o propuesta? Estamos aquí para ayudarte</p>
              </div>

              <ContactForm />
            </div>
          </div>
        </AnimatedSection>

        <Footer />
      </div>
    </PageTransition>
  );
}
