import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiGlobe } from 'react-icons/fi';
import { useCurrency } from '../context/CurrencyContext';

const LanguageSelector = () => {
  const { language, changeLanguage, t } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Lista de idiomas disponibles
  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' }
  ];

  // Cerrar el dropdown cuando se hace clic fuera de él
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

  // Obtener el nombre del idioma actual
  const getCurrentLanguageName = () => {
    const currentLang = languages.find(lang => lang.code === language);
    return currentLang ? currentLang.name : 'English';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('language')}
      >
        <FiGlobe className="text-gray-600 dark:text-gray-400" />
        <span className="font-medium">{getCurrentLanguageName()}</span>
        <FiChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('language')}</p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`w-full text-left px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  language === lang.code ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{lang.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
