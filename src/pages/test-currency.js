import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { useCurrency } from '../context/CurrencyContext';
import { FiShoppingBag, FiGlobe } from 'react-icons/fi';

const TestCurrencyPage = () => {
  const { data: session } = useSession();
  const { t, currency, language } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Productos de ejemplo para probar la conversión de moneda
  useEffect(() => {
    // Simulamos una carga de productos
    setTimeout(() => {
      setProducts([
        {
          id: '1',
          name: 'Camisa Elegante',
          price: 15000,
          currency: 'ARS',
          image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=600',
          category: 'Camisas',
          sizes: ['S', 'M', 'L', 'XL']
        },
        {
          id: '2',
          name: 'Pantalón Casual',
          price: 22000,
          currency: 'ARS',
          image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=600',
          category: 'Pantalones',
          sizes: ['30', '32', '34', '36']
        },
        {
          id: '3',
          name: 'Vestido Floral',
          price: 35000,
          currency: 'ARS',
          image: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=600',
          category: 'Vestidos',
          sizes: ['S', 'M', 'L']
        },
        {
          id: '4',
          name: 'Zapatillas Deportivas',
          price: 42000,
          currency: 'ARS',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=600',
          category: 'Calzado',
          sizes: ['39', '40', '41', '42', '43']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Layout title={`${t('currency')} - ModaVista`}>
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('products')}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-lg text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <FiGlobe className="mr-2" />
              <span>{t('language')}: {language.toUpperCase()}</span>
            </div>
            <div className="flex items-center">
              <FiShoppingBag className="mr-2" />
              <span>{t('currency')}: {currency}</span>
            </div>
          </div>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {t('welcome')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-gray-200 dark:bg-gray-800 rounded-xl h-96 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            {t('continueShopping')}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default TestCurrencyPage;
