import { useState, useEffect } from "react";
import Head from "next/head";
import { useTheme } from "next-themes";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedSection from "../components/AnimatedSection";
import { useCurrency } from "../context/CurrencyContext";

export default function Privacidad() {
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
                <title>{t('privacyPolicy')} | ModaVista</title>
                <meta name="description" content="Política de Privacidad de ModaVista. Conoce cómo protegemos tus datos personales." />
            </Head>

            <Navbar />

            <main className="container mx-auto px-4 py-20 max-w-4xl">
                <AnimatedSection animation="slideUp">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        {t('privacyPolicy')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-12 text-center">
                        Última actualización: 24 de enero de 2026
                    </p>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">1</span>
                                Introducción
                            </h2>
                            <p>
                                En ModaVista, nos tomamos muy en serio la privacidad de nuestros clientes. Esta Política de Privacidad describe cómo recopilamos, utilizamos, compartimos y protegemos su información personal cuando visita nuestro sitio web o realiza una compra.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">2</span>
                                Información que Recopilamos
                            </h2>
                            <p>
                                Recopilamos varios tipos de información de y sobre los usuarios de nuestro sitio web, incluyendo:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Información de identificación personal:</strong> Nombre, dirección de correo electrónico, dirección postal, número de teléfono.</li>
                                <li><strong>Información de pago:</strong> Detalles de la tarjeta de crédito y dirección de facturación (procesados de forma segura a través de nuestros proveedores de pago).</li>
                                <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, sistema operativo y datos sobre cómo interactúa con nuestro sitio.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">3</span>
                                Uso de su Información
                            </h2>
                            <p>
                                Utilizamos la información que recopilamos para:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Procesar y gestionar sus pedidos y devoluciones.</li>
                                <li>Comunicarnos con usted sobre sus pedidos y enviarle actualizaciones de estado.</li>
                                <li>Personalizar su experiencia en nuestro sitio y ofrecerle contenido relevante.</li>
                                <li>Mejorar nuestro sitio web y servicios al cliente.</li>
                                <li>Enviar boletines informativos y ofertas promocionales (solo si ha optado por recibirlos).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">4</span>
                                Compartir Información con Terceros
                            </h2>
                            <p>
                                No vendemos su información personal a terceros. Sin embargo, podemos compartir sus datos con proveedores de servicios de confianza que nos ayudan a operar nuestro negocio:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Procesadores de pagos para transacciones seguras.</li>
                                <li>Empresas de mensajería para la entrega de productos.</li>
                                <li>Servicios de análisis para entender el tráfico de nuestro sitio.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">5</span>
                                Seguridad de los Datos
                            </h2>
                            <p>
                                Hemos implementado medidas de seguridad diseñadas para proteger su información personal contra pérdida accidental y acceso, uso, alteración y divulgación no autorizados. Todas las transacciones de pago se cifran utilizando tecnología SSL.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">6</span>
                                Sus Derechos
                            </h2>
                            <p>
                                Usted tiene derecho a acceder, corregir o eliminar su información personal. También puede oponerse al procesamiento de sus datos o solicitar la portabilidad de los mismos. Para ejercer estos derechos, contáctenos a través de privacidad@modavista.com.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-base">7</span>
                                Cambios en la Política de Privacidad
                            </h2>
                            <p>
                                Podemos actualizar nuestra Política de Privacidad periódicamente. Cualquier cambio será publicado en esta página con una nueva fecha de "Última actualización". Le recomendamos revisar esta política con regularidad.
                            </p>
                        </section>
                    </div>
                </AnimatedSection>
            </main>

            <Footer />
        </div>
    );
}
