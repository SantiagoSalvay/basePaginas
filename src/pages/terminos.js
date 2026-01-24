import { useState, useEffect } from "react";
import Head from "next/head";
import { useTheme } from "next-themes";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedSection from "../components/AnimatedSection";
import { useCurrency } from "../context/CurrencyContext";

export default function Terminos() {
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
                <title>{t('termsAndConditions')} | ModaVista</title>
                <meta name="description" content="Términos y condiciones de uso de ModaVista. Lee nuestras reglas y regulaciones." />
            </Head>

            <Navbar />

            <main className="container mx-auto px-4 py-20 max-w-4xl">
                <AnimatedSection animation="slideUp">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        {t('termsAndConditions')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-12 text-center">
                        Última actualización: 24 de enero de 2026
                    </p>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">1</span>
                                Aceptación de los Términos
                            </h2>
                            <p>
                                Al acceder y utilizar el sitio web de ModaVista, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. Si no está de acuerdo con cualquier parte de estos términos, por favor no utilice nuestro sitio web.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">2</span>
                                Uso del Sitio Web
                            </h2>
                            <p>
                                El contenido de las páginas de este sitio web es para su información general y uso exclusivo. Está sujeto a cambios sin previo aviso. Queda prohibido el uso no autorizado de este sitio web, lo que puede dar lugar a una reclamación por daños y perjuicios y/o ser un delito penal.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">3</span>
                                Precios y Pagos
                            </h2>
                            <p>
                                Todos los precios están sujetos a cambios sin previo aviso. Nos reservamos el derecho de corregir errores en los precios que se muestren en el sitio. El pago debe realizarse al momento de la compra a través de los métodos de pago aceptados.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">4</span>
                                Envíos y Entregas
                            </h2>
                            <p>
                                Los plazos de entrega son estimaciones y no están garantizados. ModaVista no se hace responsable de retrasos fuera de nuestro control, como huelgas de transporte o condiciones climáticas extremas. El riesgo de pérdida y el título de los artículos pasan a usted en el momento de nuestra entrega al transportista.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">5</span>
                                Devoluciones y Reembolsos
                            </h2>
                            <p>
                                Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del pedido, siempre que los artículos estén en su estado original y con todas las etiquetas. Los reembolsos se procesarán a través del mismo método de pago utilizado para la compra.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">6</span>
                                Propiedad Intelectual
                            </h2>
                            <p>
                                Este sitio web contiene material que es propiedad nuestra o tiene licencia para nosotros. Este material incluye, pero no se limita a, el diseño, la disposición, el aspecto, la apariencia y los gráficos. La reproducción está prohibida salvo de conformidad con el aviso de copyright, que forma parte de estos términos y condiciones.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">7</span>
                                Limitación de Responsabilidad
                            </h2>
                            <p>
                                En la medida máxima permitida por la ley aplicable, ModaVista no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo, incluyendo la pérdida de beneficios, datos o uso.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">8</span>
                                Ley Aplicable
                            </h2>
                            <p>
                                Su uso de este sitio web y cualquier disputa que surja de dicho uso del sitio web están sujetos a las leyes del país donde ModaVista tiene su sede principal.
                            </p>
                        </section>
                    </div>
                </AnimatedSection>
            </main>

            <Footer />
        </div>
    );
}
