import { useState } from 'react'

export default function MigratePage() {
  const [migrationStatus, setMigrationStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)

  const executeSQL = async () => {
    setIsLoading(true)
    setMigrationStatus('Ejecutando script SQL de creación de tablas...')
    
    try {
      // Crear las tablas directamente usando inserts
      const response = await fetch('/api/setup-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMigrationStatus('✅ Tablas verificadas correctamente')
        return true
      } else {
        setMigrationStatus('⚠️ Necesitas crear las tablas manualmente en Supabase Dashboard')
        setResults(result)
        return false
      }
    } catch (error) {
      setMigrationStatus('❌ Error verificando tablas: ' + error.message)
      return false
    }
  }

  const migrateData = async () => {
    setIsLoading(true)
    setMigrationStatus('Migrando datos desde archivos JSON...')
    
    try {
      const response = await fetch('/api/migrate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      setResults(result)
      
      if (result.success) {
        setMigrationStatus('✅ Migración de datos completada exitosamente')
      } else {
        setMigrationStatus('❌ Error en la migración de datos')
      }
    } catch (error) {
      setMigrationStatus('❌ Error migrando datos: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const runFullMigration = async () => {
    const tablesReady = await executeSQL()
    if (tablesReady) {
      await migrateData()
    } else {
      setIsLoading(false)
    }
  }

  const createTablesManually = () => {
    const sqlScript = `-- Ejecuta este script en tu Supabase Dashboard > SQL Editor

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de usuarios
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

-- Crear tabla de productos
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

-- Crear tabla de direcciones de usuarios
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

-- Crear tabla de órdenes
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

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`

    navigator.clipboard.writeText(sqlScript)
    alert('Script SQL copiado al portapapeles. Ve a tu Supabase Dashboard > SQL Editor y pégalo.')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Migración a Supabase
          </h1>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Proceso de Migración
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Verificar/crear tablas en Supabase</li>
                <li>Migrar usuarios desde users.json</li>
                <li>Migrar productos desde products.json</li>
                <li>Configurar productos destacados</li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={runFullMigration}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Ejecutando...' : 'Ejecutar Migración Completa'}
              </button>

              <button
                onClick={createTablesManually}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
              >
                Copiar Script SQL
              </button>

              <button
                onClick={executeSQL}
                disabled={isLoading}
                className="bg-yellow-600 text-white px-6 py-3 rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                Verificar Tablas
              </button>

              <button
                onClick={migrateData}
                disabled={isLoading}
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                Solo Migrar Datos
              </button>
            </div>

            {migrationStatus && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Estado:</h3>
                <p className="text-gray-700">{migrationStatus}</p>
              </div>
            )}

            {results && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Resultados:</h3>
                <pre className="text-sm text-gray-700 bg-white p-4 rounded border overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}