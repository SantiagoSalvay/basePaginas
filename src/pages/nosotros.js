import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

// Componentes
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedSection from "../components/AnimatedSection";

export default function Nosotros() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const teamMembers = [
    {
      id: 1,
      name: "María Rodríguez",
      position: "Directora Creativa",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&q=80&fit=crop&w=400&h=400",
      bio: "Con más de 15 años de experiencia en la industria de la moda, María lidera nuestro equipo creativo con pasión y visión innovadora."
    },
    {
      id: 2,
      name: "Carlos Méndez",
      position: "Director de Diseño",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&q=80&fit=crop&w=400&h=400",
      bio: "Graduado de la Escuela de Diseño de Barcelona, Carlos aporta una perspectiva única y contemporánea a cada colección."
    },
    {
      id: 3,
      name: "Lucía Fernández",
      position: "Gerente de Sostenibilidad",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&q=80&fit=crop&w=400&h=400",
      bio: "Comprometida con el medio ambiente, Lucía asegura que nuestros procesos y materiales cumplan con los más altos estándares de sostenibilidad."
    },
    {
      id: 4,
      name: "Javier Torres",
      position: "Director de Marketing",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&q=80&fit=crop&w=400&h=400",
      bio: "Con un enfoque estratégico y creativo, Javier ha posicionado a ModaVista como una marca líder en el mercado de la moda sostenible."
    }
  ];

  const milestones = [
    {
      year: "2015",
      title: "Fundación",
      description: "ModaVista nace como un pequeño estudio de diseño con la visión de transformar la industria de la moda."
    },
    {
      year: "2017",
      title: "Primera Colección",
      description: "Lanzamiento de nuestra primera colección completa, recibida con entusiasmo por críticos y clientes."
    },
    {
      year: "2019",
      title: "Expansión Internacional",
      description: "Apertura de nuestra primera tienda internacional en París, marcando el inicio de nuestra presencia global."
    },
    {
      year: "2021",
      title: "Compromiso Sostenible",
      description: "Implementación de nuestra política de sostenibilidad 100%, utilizando exclusivamente materiales reciclados y orgánicos."
    },
    {
      year: "2023",
      title: "Innovación Digital",
      description: "Lanzamiento de nuestra plataforma digital renovada, ofreciendo una experiencia de compra inmersiva y personalizada."
    }
  ];

  return (
    <div className="min-h-screen">
      <Head>
        <title>Nosotros | ModaVista</title>
        <meta name="description" content="Conoce la historia, valores y equipo detrás de ModaVista" />
      </Head>

      <Navbar />

      {/* Hero Section */}
      <AnimatedSection animation="scrollFade" className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&q=80&fit=crop"
            alt="Equipo ModaVista"
            layout="fill"
            objectFit="cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Nuestra Historia</h1>
          <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto">
            Descubre quiénes somos, nuestra misión y los valores que nos impulsan
          </p>
        </div>
      </AnimatedSection>

      {/* Nuestra Misión */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Nuestra Misión
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mb-10"></div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="slideRight" className="order-2 md:order-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Redefiniendo la Moda Contemporánea
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                En ModaVista, creemos que la moda es más que ropa; es una forma de expresión, identidad y conexión. Nuestra misión es crear prendas que no solo se vean bien, sino que también se sientan bien y hagan bien.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Cada pieza que diseñamos está pensada para durar, tanto en estilo como en calidad. Nos esforzamos por combinar diseños contemporáneos con prácticas sostenibles, asegurando que nuestro impacto en el planeta sea positivo.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Nuestra visión es liderar el camino hacia un futuro donde la moda y la sostenibilidad vayan de la mano, inspirando a la industria y a nuestros clientes a tomar decisiones más conscientes.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="slideLeft" className="order-1 md:order-2">
              <div className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&q=80&fit=crop"
                  alt="Diseño ModaVista"
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-700 hover:scale-105"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Nuestros Valores
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mb-10"></div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Estos principios guían cada decisión que tomamos y cada prenda que creamos
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <AnimatedSection animation="slideUp" delay={0.1}>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg h-full">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sostenibilidad</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Nos comprometemos a utilizar materiales sostenibles y procesos de producción éticos que minimicen nuestro impacto ambiental y promuevan prácticas responsables.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideUp" delay={0.2}>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg h-full">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Innovación</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Buscamos constantemente nuevas formas de crear, diseñar y presentar nuestras colecciones, empujando los límites de lo que es posible en la moda contemporánea.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideUp" delay={0.3}>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg h-full">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Inclusividad</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Creemos que la moda debe ser para todos. Diseñamos con la diversidad en mente, celebrando diferentes cuerpos, culturas y expresiones personales.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Nuestro Equipo */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Nuestro Equipo
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mb-10"></div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Conoce a las mentes creativas detrás de ModaVista
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <AnimatedSection 
                key={member.id} 
                animation="slideUp" 
                delay={index * 0.1}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="relative h-80 w-full overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{member.name}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">{member.position}</p>
                    <p className="text-gray-700 dark:text-gray-300">{member.bio}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Nuestra Trayectoria
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mb-10"></div>
          </AnimatedSection>

          <div className="relative">
            {/* Línea de tiempo vertical */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-200 dark:bg-indigo-800"></div>

            {/* Hitos */}
            {milestones.map((milestone, index) => (
              <AnimatedSection 
                key={index} 
                animation={index % 2 === 0 ? "slideRight" : "slideLeft"} 
                delay={index * 0.1}
                className="relative mb-16 last:mb-0"
              >
                <div className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="hidden md:block w-1/2"></div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold z-10">
                    {milestone.year}
                  </div>
                  <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{milestone.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300">{milestone.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
