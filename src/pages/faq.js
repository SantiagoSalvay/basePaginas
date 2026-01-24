import { useState, useEffect } from "react";
import Head from "next/head";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedSection from "../components/AnimatedSection";
import { useCurrency } from "../context/CurrencyContext";

const faqData = [
    {
        category: "Pedidos y Envíos",
        questions: [
            {
                id: "q1",
                question: "¿Cuánto tarda en llegar mi pedido?",
                answer: "Los pedidos nacionales suelen tardar entre 3 y 5 días laborables. Para envíos internacionales, el plazo puede extenderse de 7 a 15 días laborables según el destino."
            },
            {
                id: "q2",
                question: "¿Cómo puedo rastrear mi pedido?",
                answer: "Una vez que tu pedido sea enviado, recibirás un correo electrónico con un número de seguimiento y un enlace para rastrear tu paquete en tiempo real."
            },
            {
                id: "q3",
                question: "¿Hacen envíos a todo el mundo?",
                answer: "Sí, realizamos envíos a la mayoría de los países. Los costos de envío y los tiempos de entrega varían según la ubicación y se calcularán automáticamente al finalizar la compra."
            }
        ]
    },
    {
        category: "Devoluciones y Reembolsos",
        questions: [
            {
                id: "q4",
                question: "¿Cuál es su política de devoluciones?",
                answer: "Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del pedido. Los artículos deben estar en su estado original, sin usar y con todas las etiquetas puestas."
            },
            {
                id: "q5",
                question: "¿Cómo solicito un reembolso?",
                answer: "Para solicitar un reembolso, por favor contáctanos a través de nuestro formulario de contacto o envía un correo a soporte@modavista.com con tu número de pedido."
            },
            {
                id: "q6",
                question: "¿Quién paga los gastos de envío de la devolución?",
                answer: "Si el artículo llegó defectuoso o el error fue nuestro, nosotros cubriremos los gastos. En caso de cambios por talla o gusto personal, el cliente deberá hacerse cargo del costo del envío de vuelta."
            }
        ]
    },
    {
        category: "Productos y Tallas",
        questions: [
            {
                id: "q7",
                question: "¿Cómo sé cuál es mi talla?",
                answer: "En cada página de producto encontrarás una 'Guía de Tallas' detallada con medidas en centímetros para ayudarte a elegir la opción perfecta."
            },
            {
                id: "q8",
                question: "¿Sus materiales son sostenibles?",
                answer: "Sí, en ModaVista estamos comprometidos con el medio ambiente. Utilizamos algodón orgánico, poliéster reciclado y otros materiales eco-amigables en la mayoría de nuestras colecciones."
            }
        ]
    }
];

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 dark:border-gray-800 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
                <span className="text-lg font-medium">{question}</span>
                <svg
                    className={`w-6 h-6 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-gray-600 dark:text-gray-400">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FAQ() {
    const { theme, setTheme } = useTheme();
    const { t } = useCurrency();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Head>
                <title>{t('faq')} | ModaVista</title>
                <meta name="description" content="Resolvemos tus dudas sobre envíos, devoluciones y productos de ModaVista." />
            </Head>

            <Navbar />

            {/* Hero FAQ */}
            <section className="bg-indigo-600 dark:bg-indigo-900 py-20">
                <div className="container mx-auto px-4 text-center">
                    <AnimatedSection animation="slideUp">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                            {t('faq')}
                        </h1>
                        <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                            ¿Tienes alguna duda? Estamos aquí para ayudarte. Encuentra respuestas rápidas a las consultas más comunes.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            <main className="container mx-auto px-4 py-20 max-w-4xl">
                <div className="space-y-16">
                    {faqData.map((category, index) => (
                        <AnimatedSection key={index} animation="slideUp" delay={index * 0.1}>
                            <h2 className="text-3xl font-display font-bold mb-8 flex items-center">
                                <span className="w-1.5 h-8 bg-indigo-600 dark:bg-indigo-400 mr-4 rounded-full"></span>
                                {category.category}
                            </h2>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 shadow-sm">
                                {category.questions.map((item) => (
                                    <FAQItem key={item.id} question={item.question} answer={item.answer} />
                                ))}
                            </div>
                        </AnimatedSection>
                    ))}
                </div>

                {/* Contact CTA */}
                <AnimatedSection animation="slideUp" className="mt-20 text-center bg-gray-900 text-white p-12 rounded-3xl overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

                    <h2 className="text-3xl font-bold mb-6">¿No encuentras lo que buscas?</h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                        Si tienes alguna otra pregunta o necesitas asistencia personalizada, nuestro equipo de soporte está listo para ayudarte.
                    </p>
                    <a
                        href="/contacto"
                        className="inline-block px-8 py-4 bg-white text-gray-900 font-bold rounded-full transition-transform hover:scale-105 active:scale-95"
                    >
                        Contactar Soporte
                    </a>
                </AnimatedSection>
            </main>

            <Footer />
        </div>
    );
}
