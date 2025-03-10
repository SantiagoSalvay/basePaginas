import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import PageTransition from '../../components/PageTransition';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        toast.success('Correo de recuperación enviado correctamente');
      } else {
        toast.error(data.error || 'Error al enviar el correo de recuperación');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ha ocurrido un error. Por favor, intenta nuevamente');
    } finally {
      setLoading(false);
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
        <title>Recuperar Contraseña | ModaVista</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
        >
          {!submitted ? (
            <>
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <FaEnvelope className="h-10 w-10 text-blue-600 dark:text-blue-300" />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Recuperar Contraseña</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                </p>
              </div>
              
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Correo Electrónico
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      "Enviar Enlace de Recuperación"
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg className="h-10 w-10 text-green-600 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Correo Enviado</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Hemos enviado un enlace de recuperación a <span className="font-medium text-blue-600 dark:text-blue-400">{email}</span>
              </p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              Volver a Iniciar Sesión
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
