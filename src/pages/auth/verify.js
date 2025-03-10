import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import PageTransition from '../../components/PageTransition';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    if (!token) return;
    
    // Iniciar la cuenta regresiva para redirección
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          // Redirigir a la página principal
          router.push('/');
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    // Limpiar el temporizador cuando el componente se desmonte
    return () => clearInterval(timer);
  }, [token, router]);
  
  // Animaciones
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };
  
  return (
    <PageTransition>
      <Head>
        <title>Cuenta Verificada | ModaVista</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
        >
          <div className="text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <FaCheckCircle className="h-10 w-10 text-green-600 dark:text-green-300" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">¡Cuenta Verificada!</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Tu cuenta ha sido verificada correctamente
            </p>
            
            <div className="mt-8 rounded-md bg-green-50 dark:bg-green-900/30 p-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                Serás redirigido automáticamente a la página principal en <span className="font-bold">{countdown}</span> segundos...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
