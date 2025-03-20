import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCurrency } from '../context/CurrencyContext';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const CurrencySelector = () => {
  const { currency, changeCurrency, t, currencyToFlag, currencyToName } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el menú al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lista de monedas disponibles
  const currencies = [
    { code: 'ARS', name: currencyToName.ARS },
    { code: 'USD', name: currencyToName.USD },
    { code: 'EUR', name: currencyToName.EUR },
    { code: 'PYG', name: currencyToName.PYG },
    { code: 'BRL', name: currencyToName.BRL },
  ];

  // Mapeo de divisas a idiomas
  const currencyToLanguage = {
    'ARS': 'es', // Español
    'USD': 'en', // Inglés
    'EUR': 'en', // Inglés
    'PYG': 'es', // Español
    'BRL': 'pt', // Portugués
  };

  // Función para cargar traducciones
  const loadTranslations = (language) => {
    fetch(`/translations/${language}.json`)
      .then(response => response.json())
      .then(translations => {
        document.querySelectorAll('[data-translate-key]').forEach(element => {
          const key = element.getAttribute('data-translate-key');
          element.textContent = translations[key] || element.textContent;
        });
      });
  };

  // Función para manejar la selección de moneda
  const handleCurrencyChange = (currencyCode) => {
    changeCurrency(currencyCode);
    const language = currencyToLanguage[currencyCode];
    if (language) {
      loadTranslations(language);
    }
    setIsOpen(false);
  };

  // Animaciones
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -5,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white"
        aria-label={t('selectCurrency')}
      >
        <div className="relative w-8 h-5 overflow-hidden border border-gray-200 dark:border-gray-700">
          <Image
            src={`/flags/${currencyToFlag[currency]}.svg`}
            alt={currency}
            width={32}
            height={20}
            className="object-fill w-full h-full"
            style={{ aspectRatio: '16/10' }}
          />
        </div>
        <span className="text-sm font-medium">{currency}</span>
        <FiChevronDown
          size={16}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50"
          >
            {currencies.map((currencyOption) => (
              <button
                key={currencyOption.code}
                onClick={() => handleCurrencyChange(currencyOption.code)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <div className="relative w-8 h-5 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={`/flags/${currencyToFlag[currencyOption.code]}.svg`}
                      alt={currencyOption.code}
                      width={32}
                      height={20}
                      className="object-fill w-full h-full"
                      style={{ aspectRatio: '16/10' }}
                    />
                  </div>
                  <span>{currencyOption.name}</span>
                </div>
                {currency === currencyOption.code && (
                  <FiCheck size={16} className="text-primary-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySelector;
