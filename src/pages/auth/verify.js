import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const { data: session } = useSession();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    // Si ya hay sesión, redirigir
    if (session) {
      setStatus('success');
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session, router]);

  useEffect(() => {
    if (!token || verificationAttempted.current || session) return;

    const verifyToken = async () => {
      verificationAttempted.current = true;

      try {
        const result = await signIn('credentials', {
          verificationToken: token,
          redirect: false,
        });

        if (result?.error) {
          setStatus('error');
          setErrorMessage('El enlace de verificación es inválido o ha expirado.');
        } else {
          setStatus('success');
          // Iniciar conteo solo si fue exitoso
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                router.push('/');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Ocurrió un error inesperado al verificar.');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token, session, router]);

  // Animaciones
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="page-transition">
      <Head>
        <title>Verificación de Cuenta | ModaVista</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center"
        >
          {status === 'verifying' && (
            <div className="flex flex-col items-center">
              <FaSpinner className="h-16 w-16 text-indigo-500 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verificando tu cuenta...</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Por favor, espera un momento.</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="mx-auto h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-6">
                <FaCheckCircle className="h-10 w-10 text-green-600 dark:text-green-300" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">¡Cuenta Verificada!</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Tu cuenta ha sido verificada correctamente y ya has iniciado sesión.
              </p>

              <div className="mt-8 rounded-md bg-green-50 dark:bg-green-900/30 p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Serás redirigido automáticamente a la página principal en <span className="font-bold">{countdown}</span> segundos...
                </p>
              </div>

              <button
                onClick={() => router.push('/')}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Ir al inicio ahora
              </button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="mx-auto h-20 w-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-6">
                <FaTimesCircle className="h-10 w-10 text-red-600 dark:text-red-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Error de Verificación</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {errorMessage}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ir a Iniciar Sesión
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Esto fuerza Next.js a usar SSR para esta página
export async function getServerSideProps() {
  return {
    props: {},
  }
}
