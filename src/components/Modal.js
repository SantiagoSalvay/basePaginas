import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function Modal({ title, children, onClose, maxWidth = 'max-w-4xl' }) {
  useEffect(() => {
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
    
    // Manejar tecla Escape para cerrar el modal
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Limpiar al desmontar
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  // Evitar que clics dentro del modal lo cierren
  const handleModalClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black bg-opacity-50"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={handleModalClick}
          className={`${maxWidth} w-full bg-white rounded-lg shadow-xl overflow-hidden z-10`}
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(100vh-10rem)]">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 