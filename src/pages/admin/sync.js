import { useState, useEffect } from 'react'

export default function SyncPage() {
  const [syncStatus, setSyncStatus] = useState('ready')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const executeSync = async () => {
    setIsLoading(true)
    setSyncStatus('running')
    
    try {
      const response = await fetch('/api/sync-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      setResults(result)
      
      if (result.success) {
        setSyncStatus('completed')
      } else {
        setSyncStatus('needs_tables')
      }
    } catch (error) {
      setSyncStatus('error')
      setResults({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const copySQL = () => {
    const sql = `-- Script SQL para Supabase Dashboard
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100),
    reset_token VARCHAR(100),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(500),
    stock INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    shipping_address JSONB,
    items JSONB,
    discount_applied DECIMAL(10,2) DEFAULT 0,
    receipt_image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`

    navigator.clipboard.writeText(sql)
    alert('Script SQL copiado al portapapeles!')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            🔄 Sincronización con Supabase
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel de Control */}
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  Estado de Sincronización
                </h2>
                
                <div className="space-y-4">
                  {syncStatus === 'ready' && (
                    <div className="text-blue-700">
                      ✅ Listo para sincronizar
                    </div>
                  )}
                  
                  {syncStatus === 'running' && (
                    <div className="text-yellow-700">
                      ⏳ Ejecutando sincronización...
                    </div>
                  )}
                  
                  {syncStatus === 'completed' && (
                    <div className="text-green-700">
                      ✅ Sincronización completada exitosamente
                    </div>
                  )}
                  
                  {syncStatus === 'needs_tables' && (
                    <div className="text-orange-700">
                      ⚠️ Necesitas crear las tablas en Supabase primero
                    </div>
                  )}
                  
                  {syncStatus === 'error' && (
                    <div className="text-red-700">
                      ❌ Error en la sincronización
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={executeSync}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                  {isLoading ? '🔄 Sincronizando...' : '🚀 Ejecutar Sincronización'}
                </button>

                <button
                  onClick={copySQL}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold"
                >
                  📋 Copiar Script SQL
                </button>

                <a
                  href="https://app.supabase.com/project/koqjdrfhegaenecgnowx/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-semibold text-center"
                >
                  🔗 Abrir Supabase Dashboard
                </a>
              </div>

              {syncStatus === 'needs_tables' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    📋 Instrucciones:
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-yellow-800">
                    <li>Haz clic en "Copiar Script SQL"</li>
                    <li>Ve a tu Supabase Dashboard</li>
                    <li>Navega a "SQL Editor"</li>
                    <li>Pega y ejecuta el script</li>
                    <li>Vuelve aquí y ejecuta la sincronización</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Panel de Resultados */}
            <div className="space-y-6">
              {results && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📊 Resultados de Sincronización
                  </h3>
                  
                  {results.results && (
                    <div className="space-y-4">
                      {Object.entries(results.results).map(([step, data]) => (
                        <div key={step} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${
                              data.status === 'completed' ? 'bg-green-500' :
                              data.status === 'partial' ? 'bg-yellow-500' :
                              data.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></span>
                            <span className="font-medium text-gray-900">
                              {step.replace('step', 'Paso ').replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {data.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.sqlScript && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Script SQL requerido:
                      </h4>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-64">
                        {results.sqlScript.substring(0, 500)}...
                      </pre>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  🎯 ¿Qué hace la sincronización?
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li>• Verifica que las tablas existan en Supabase</li>
                  <li>• Migra 3 usuarios desde users.json</li>
                  <li>• Migra 3 productos desde products.json</li>
                  <li>• Configura productos destacados</li>
                  <li>• Verifica que todo se migró correctamente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}