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
        const response = await axios.get('/api/products');
        
        // Obtener 4 productos destacados aleatoriamente de diferentes categorías
        const allProducts = [];
        Object.keys(response.data).forEach(category => {
          if (response.data[category] && response.data[category].length > 0) {
            allProducts.push(...response.data[category]);
          }
        });
        
        // Si hay productos disponibles, seleccionar 4 aleatoriamente
        if (allProducts.length > 0) {
          // Mezclar el array de productos
          const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
          // Tomar hasta 4 productos
          const selected = shuffled.slice(0, Math.min(4, shuffled.length));
          setFeaturedProducts(selected);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("No se pudieron cargar los productos destacados.");
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
        <AnimatedSection animation="scrollSlide" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product, index) => (
                  <AnimatedSection 
                    key={product.id} 
                    animation="slideUp" 
                    delay={index * 0.1}
                    threshold={0.2}
                  >
                    <ProductCard product={product} />
                  </AnimatedSection>
                ))}
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
                <button className="hero-button primary-button">Conoce Más</button>
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
