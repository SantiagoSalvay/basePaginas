import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import PageTransition from '../../components/PageTransition';
import { motion } from 'framer-motion';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';

export default function VerificationPending() {
  const router = useRouter();
  const { email } = router.query;
  const [emailSent, setEmailSent] = useState(false);
  
  // Simular el envío de correo electrónico
  useEffect(() => {
    if (email) {
      // En un entorno real, aquí se verificaría si el correo ya fue enviado
      setEmailSent(true);
    }
  }, [email]);

  // Función para reenviar correo de verificación
  const handleResendEmail = async () => {
    if (email) {
      try {
        const response = await fetch('/api/auth/resend-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert('Correo de verificación reenviado correctamente');
        } else {
          alert(`Error: ${data.error || 'No se pudo reenviar el correo'}`);
        }
      } catch (error) {
        console.error('Error al reenviar correo:', error);
        alert('Ha ocurrido un error al reenviar el correo de verificación');
      }
    }
  };

  // Animaciones
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <PageTransition>
      <Head>
        <title>Verificación Pendiente | ModaVista</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
        >
          <div className="text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <FaEnvelope className="h-10 w-10 text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Verificación Pendiente</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Hemos enviado un correo de verificación a <span className="font-medium text-blue-600 dark:text-blue-400">{email}</span>
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Por favor, revisa tu bandeja de entrada y sigue las instrucciones en el correo para activar tu cuenta.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ¿No has recibido el correo? Revisa tu carpeta de spam o
              </p>
              <button
                onClick={handleResendEmail}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                Reenviar correo de verificación
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center">
                <Link href="/auth/signin" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                  Volver a Iniciar Sesión
                </Link>
                <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                <Link href="/" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                  Ir a la Página Principal
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
