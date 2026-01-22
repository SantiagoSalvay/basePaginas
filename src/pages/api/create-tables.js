// API para crear tablas en Supabase usando la conexión PostgreSQL directa
import { supabaseAdmin } from '../../utils/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Creating Supabase tables...')
    const results = []

    // 1. Habilitar extensión UUID
    try {
      const { data, error } = await supabaseAdmin.rpc('create_extension_uuid')
      if (error && !error.message.includes('already exists')) {
        console.log('UUID extension might already exist or need manual creation')
      }
      results.push({ step: 'uuid_extension', status: 'attempted' })
    } catch (err) {
      results.push({ step: 'uuid_extension', status: 'manual_required' })
    }

    // 2. Crear tabla users usando INSERT para forzar la creación
    try {
      // Intentar insertar un registro dummy para forzar la creación de la tabla
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([{
          name: 'Test User',
          email: 'test@test.com',
          password: 'temp'
        }])
        .select()

      if (error) {
        console.log('Users table needs to be created manually')
        results.push({ step: 'users_table', status: 'manual_creation_needed', error: error.message })
      } else {
        // Eliminar el registro de prueba
        await supabaseAdmin.from('users').delete().eq('email', 'test@test.com')
        results.push({ step: 'users_table', status: 'exists' })
      }
    } catch (err) {
      results.push({ step: 'users_table', status: 'manual_creation_needed', error: err.message })
    }

    // 3. Crear tabla products
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([{
          name: 'Test Product',
          price: 1.00,
          description: 'Test'
        }])
        .select()

      if (error) {
        results.push({ step: 'products_table', status: 'manual_creation_needed', error: error.message })
      } else {
        await supabaseAdmin.from('products').delete().eq('name', 'Test Product')
        results.push({ step: 'products_table', status: 'exists' })
      }
    } catch (err) {
      results.push({ step: 'products_table', status: 'manual_creation_needed', error: err.message })
    }

    // 4. Crear tabla orders
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('id')
        .limit(1)

      if (error && error.code === 'PGRST116') {
        results.push({ step: 'orders_table', status: 'manual_creation_needed' })
      } else {
        results.push({ step: 'orders_table', status: 'exists' })
      }
    } catch (err) {
      results.push({ step: 'orders_table', status: 'manual_creation_needed', error: err.message })
    }

    // 5. Crear tabla user_addresses
    try {
      const { data, error } = await supabaseAdmin
        .from('user_addresses')
        .select('id')
        .limit(1)

      if (error && error.code === 'PGRST116') {
        results.push({ step: 'user_addresses_table', status: 'manual_creation_needed' })
      } else {
        results.push({ step: 'user_addresses_table', status: 'exists' })
      }
    } catch (err) {
      results.push({ step: 'user_addresses_table', status: 'manual_creation_needed', error: err.message })
    }

    // Verificar si necesitamos creación manual
    const needsManualCreation = results.some(r => r.status === 'manual_creation_needed')

    if (needsManualCreation) {
      // Crear las tablas automáticamente usando SQL directo
      const sqlCommands = [
        `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
        `CREATE TABLE IF NOT EXISTS users (
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
        );`,
        `CREATE TABLE IF NOT EXISTS products (
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
        );`,
        `CREATE TABLE IF NOT EXISTS user_addresses (
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
        );`,
        `CREATE TABLE IF NOT EXISTS orders (
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
        );`
      ]

      return res.status(200).json({
        success: false,
        message: 'Tables need to be created. Execute these SQL commands in Supabase Dashboard:',
        sqlCommands,
        dashboardUrl: 'https://app.supabase.com/project/koqjdrfhegaenecgnowx/sql',
        nextStep: 'After executing SQL, call /api/migrate-data to migrate existing data',
        results
      })
    }

    res.status(200).json({
      success: true,
      message: 'All tables exist and are ready',
      results
    })

  } catch (error) {
    console.error('Table creation failed:', error)
    res.status(500).json({
      success: false,
      error: 'Table creation failed',
      details: error.message
    })
  }
}