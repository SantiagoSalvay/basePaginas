import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";
import PageTransition from "../components/PageTransition";

// Componentes
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedSection from "../components/AnimatedSection";
import ContactForm from "../components/ContactForm";

function Contacto() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="page-transition">
      <div className="min-h-screen">
        <Head>
          <title>Contacto | ModaVista</title>
          <meta name="description" content="Ponte en contacto con nosotros en ModaVista" />
        </Head>

        <Navbar />

        {/* Hero Section */}
        <AnimatedSection animation="scrollFade" className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&q=80&fit=crop"
              alt="Contacto ModaVista"
              layout="fill"
              objectFit="cover"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>

          <div className="container mx-auto px-4 z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Contacto</h1>
            <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto">
              Estamos aquí para ayudarte. ¡Contáctanos hoy mismo!
            </p>
          </div>
        </AnimatedSection>

        {/* Contact Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="slideUp" className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
                Envíanos un Mensaje
              </h2>
              <div className="w-24 h-1 bg-indigo-600 mx-auto mb-10"></div>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                ¿Tienes alguna pregunta o comentario? ¡No dudes en contactarnos!
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <AnimatedSection animation="slideRight" className="lg:col-span-3">
                <ContactForm />
              </AnimatedSection>

              <AnimatedSection animation="slideLeft" className="lg:col-span-2">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg p-8 h-full">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Información de Contacto
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-4">
                        <FiMail className="text-indigo-600 dark:text-indigo-400" size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Email</h4>
                        <a href="mailto:info@modavista.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                          info@modavista.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-4">
                        <FiPhone className="text-indigo-600 dark:text-indigo-400" size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Teléfono</h4>
                        <a href="tel:+15551234567" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                          +1 (555) 123-4567
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-4">
                        <FiMapPin className="text-indigo-600 dark:text-indigo-400" size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Dirección</h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          123 Moda Street, Suite 456
                          <br />
                          Ciudad de la Moda, CA 91234
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-4">
                        <FiClock className="text-indigo-600 dark:text-indigo-400" size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Horario</h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          Lunes - Viernes: 9:00 - 18:00
                          <br />
                          Sábado: 10:00 - 15:00
                          <br />
                          Domingo: Cerrado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <AnimatedSection animation="fadeIn" className="h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1553290322-e895dd7dccec?auto=format&q=80&fit=crop"
              alt="Mapa de ubicación"
              layout="fill"
              objectFit="cover"
              quality={90}
            />
            <div className="absolute inset-0 bg-indigo-900 bg-opacity-20"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Visítanos</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Estamos ubicados en el corazón del distrito de moda. ¡Te esperamos!
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300"
              >
                Ver en Google Maps
              </a>
            </div>
          </div>
        </AnimatedSection>

        <Footer />
      </div>
    </div>
  );
}

export default Contacto;

// Deshabilitar SSG para esta página
export async function getServerSideProps() {
  return {
    props: {}
  };
}
