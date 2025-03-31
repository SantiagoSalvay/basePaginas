import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { toast } from 'react-toastify';

const AplicarDescuento = () => {
  const [productId, setProductId] = useState('');
  const [percentage, setPercentage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const numId = parseInt(productId, 10);
      const numPercentage = parseFloat(percentage);

      if (isNaN(numId) || isNaN(numPercentage)) {
        throw new Error('ID y porcentaje deben ser números válidos');
      }

      const response = await axios.post('/api/apply-discount', {
        id: numId,
        discount: {
          percentage: numPercentage
        }
      });

      setResult(response.data);
      toast.success(`Descuento aplicado: ${response.data.message}`);
    } catch (err) {
      console.error('Error al aplicar descuento:', err);
      setError(err.response?.data?.error || err.message || 'Error desconocido');
      toast.error('Error al aplicar descuento');
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar descuento rápido a la Camisa Premium
  const aplicarDescuentoCamisa = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/apply-discount', {
        id: 1001, // ID de la Camisa Premium
        discount: {
          percentage: 20 // 20% de descuento
        }
      });

      setResult(response.data);
      toast.success(`Descuento aplicado: ${response.data.message}`);
    } catch (err) {
      console.error('Error al aplicar descuento:', err);
      setError(err.response?.data?.error || err.message || 'Error desconocido');
      toast.error('Error al aplicar descuento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Aplicar Descuento | Admin</title>
      </Head>

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          Aplicar Descuento a Producto
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Aplicar Descuento Personalizado
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="productId" className="block text-gray-700 dark:text-gray-300 mb-1">
                  ID del Producto
                </label>
                <input
                  type="number"
                  id="productId"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="percentage" className="block text-gray-700 dark:text-gray-300 mb-1">
                  Porcentaje de Descuento
                </label>
                <input
                  type="number"
                  id="percentage"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="99"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md disabled:opacity-50"
              >
                {loading ? 'Aplicando...' : 'Aplicar Descuento'}
              </button>
            </form>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Descuento Rápido - Camisa Premium
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aplica un descuento del 20% a la Camisa Premium (ID: 1001) con un solo clic.
            </p>
            
            <button
              onClick={aplicarDescuentoCamisa}
              disabled={loading}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md disabled:opacity-50"
            >
              {loading ? 'Aplicando...' : 'Aplicar 20% de Descuento a Camisa Premium'}
            </button>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Después de aplicar:</h3>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Ir a la <a href="/product/1001" className="text-blue-600 hover:underline" target="_blank">página del producto</a> para ver el descuento.</li>
                <li>Verificar el estado actual con la <a href="/api/check-product?id=1001" className="text-blue-600 hover:underline" target="_blank">API de diagnóstico</a>.</li>
                <li>Comprobar que el descuento <strong>persiste</strong> entre recargas visitando la <a href="/api/test-persistence" className="text-blue-600 hover:underline" target="_blank">API de verificación de persistencia</a>.</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2">Importante: Persistencia de datos</h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
            <li>Los descuentos aplicados <strong>ahora persisten</strong> entre recargas de la página y reinicios del servidor.</li>
            <li>Todos los productos y sus descuentos se guardan automáticamente en un archivo JSON.</li>
            <li>Los descuentos aplicados serán visibles tanto en el carrusel como en la página de detalle del producto.</li>
          </ul>
        </div>
        
        {result && (
          <div className="mt-8 bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <h2 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-300">
              Descuento Aplicado Correctamente
            </h2>
            <pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        {error && (
          <div className="mt-8 bg-red-50 dark:bg-red-900 p-4 rounded-lg border border-red-200 dark:border-red-700">
            <h2 className="text-xl font-semibold mb-2 text-red-800 dark:text-red-300">
              Error
            </h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AplicarDescuento;

// Esto fuerza Next.js a usar SSR para esta página
export async function getServerSideProps() {
  return {
    props: {}, // se pasarán al componente de página
  }
} 