// API para sincronización completa con Supabase
import { supabaseAdmin } from '../../utils/supabase'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Starting complete Supabase synchronization...')
    
    const syncResults = {
      step1_tables: { status: 'pending', message: '', details: [] },
      step2_users: { status: 'pending', message: '', details: [] },
      step3_products: { status: 'pending', message: '', details: [] },
      step4_featured: { status: 'pending', message: '', details: [] },
      step5_verification: { status: 'pending', message: '', details: [] }
    }

    // PASO 1: Verificar/Crear tablas
    syncResults.step1_tables.status = 'running'
    syncResults.step1_tables.message = 'Verificando tablas...'

    try {
      // Verificar si las tablas existen
      const tablesCheck = await Promise.allSettled([
        supabaseAdmin.from('users').select('count').limit(1),
        supabaseAdmin.from('products').select('count').limit(1),
        supabaseAdmin.from('orders').select('count').limit(1),
        supabaseAdmin.from('user_addresses').select('count').limit(1)
      ])

      const tablesExist = tablesCheck.every(result => 
        result.status === 'fulfilled' && 
        (!result.value.error || result.value.error.code !== 'PGRST116')
      )

      if (!tablesExist) {
        syncResults.step1_tables.status = 'manual_required'
        syncResults.step1_tables.message = 'Las tablas necesitan ser creadas manualmente en Supabase Dashboard'
        syncResults.step1_tables.details = [
          'Ve a: https://app.supabase.com/project/koqjdrfhegaenecgnowx/sql',
          'Ejecuta el script SQL que se proporciona a continuación'
        ]

        return res.status(200).json({
          success: false,
          message: 'Sincronización detenida: Tablas no existen',
          results: syncResults,
          sqlScript: `-- Ejecuta este script en Supabase Dashboard > SQL Editor
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

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`
        })
      }

      syncResults.step1_tables.status = 'completed'
      syncResults.step1_tables.message = 'Tablas verificadas correctamente'

    } catch (error) {
      syncResults.step1_tables.status = 'error'
      syncResults.step1_tables.message = `Error verificando tablas: ${error.message}`
      return res.status(500).json({ success: false, results: syncResults })
    }

    // PASO 2: Migrar usuarios
    syncResults.step2_users.status = 'running'
    syncResults.step2_users.message = 'Migrando usuarios...'

    try {
      const usersPath = path.join(process.cwd(), 'data', 'users.json')
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
      
      let usersSuccess = 0
      let usersErrors = 0

      for (const user of usersData.users) {
        try {
          const { data, error } = await supabaseAdmin
            .from('users')
            .upsert({
              id: user.id === '1' ? undefined : user.id,
              name: user.name,
              email: user.email,
              password: user.password,
              phone: user.phone || null,
              role: user.role || 'user',
              email_verified: user.emailVerified || false,
              verification_token: user.verificationToken || null,
              reset_token: user.resetToken || null,
              reset_token_expires: user.resetTokenExpiry ? new Date(user.resetTokenExpiry).toISOString() : null,
              created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString()
            }, { 
              onConflict: 'email' 
            })
            .select()

          if (error) {
            usersErrors++
            syncResults.step2_users.details.push({ user: user.email, error: error.message })
          } else {
            usersSuccess++
            syncResults.step2_users.details.push({ user: user.email, status: 'migrated' })
          }
        } catch (err) {
          usersErrors++
          syncResults.step2_users.details.push({ user: user.email, error: err.message })
        }
      }

      syncResults.step2_users.status = usersErrors === 0 ? 'completed' : 'partial'
      syncResults.step2_users.message = `${usersSuccess} usuarios migrados, ${usersErrors} errores`

    } catch (error) {
      syncResults.step2_users.status = 'error'
      syncResults.step2_users.message = `Error migrando usuarios: ${error.message}`
    }

    // PASO 3: Migrar productos
    syncResults.step3_products.status = 'running'
    syncResults.step3_products.message = 'Migrando productos...'

    try {
      const productsPath = path.join(process.cwd(), 'data', 'products.json')
      const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
      
      let productsSuccess = 0
      let productsErrors = 0

      for (const [category, products] of Object.entries(productsData)) {
        for (const product of products) {
          try {
            const { data, error } = await supabaseAdmin
              .from('products')
              .upsert({
                id: product.id,
                name: product.name,
                description: `Producto de la categoría ${category}`,
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                category: product.category || category,
                image_url: product.image,
                stock: product.stock || 10,
                is_featured: false,
                created_at: new Date().toISOString()
              }, { 
                onConflict: 'id' 
              })
              .select()

            if (error) {
              productsErrors++
              syncResults.step3_products.details.push({ product: product.name, error: error.message })
            } else {
              productsSuccess++
              syncResults.step3_products.details.push({ product: product.name, status: 'migrated' })
            }
          } catch (err) {
            productsErrors++
            syncResults.step3_products.details.push({ product: product.name, error: err.message })
          }
        }
      }

      syncResults.step3_products.status = productsErrors === 0 ? 'completed' : 'partial'
      syncResults.step3_products.message = `${productsSuccess} productos migrados, ${productsErrors} errores`

    } catch (error) {
      syncResults.step3_products.status = 'error'
      syncResults.step3_products.message = `Error migrando productos: ${error.message}`
    }

    // PASO 4: Configurar productos destacados
    syncResults.step4_featured.status = 'running'
    syncResults.step4_featured.message = 'Configurando productos destacados...'

    try {
      const featuredPath = path.join(process.cwd(), 'data', 'featured-products.json')
      const featuredData = JSON.parse(fs.readFileSync(featuredPath, 'utf8'))
      
      let featuredSuccess = 0
      let featuredErrors = 0

      for (const productId of featuredData) {
        try {
          const { data, error } = await supabaseAdmin
            .from('products')
            .update({ is_featured: true })
            .eq('id', productId)
            .select()

          if (error) {
            featuredErrors++
            syncResults.step4_featured.details.push({ productId, error: error.message })
          } else if (data && data.length > 0) {
            featuredSuccess++
            syncResults.step4_featured.details.push({ productId, status: 'featured' })
          } else {
            featuredErrors++
            syncResults.step4_featured.details.push({ productId, error: 'Product not found' })
          }
        } catch (err) {
          featuredErrors++
          syncResults.step4_featured.details.push({ productId, error: err.message })
        }
      }

      syncResults.step4_featured.status = featuredErrors === 0 ? 'completed' : 'partial'
      syncResults.step4_featured.message = `${featuredSuccess} productos destacados, ${featuredErrors} errores`

    } catch (error) {
      syncResults.step4_featured.status = 'error'
      syncResults.step4_featured.message = `Error configurando destacados: ${error.message}`
    }

    // PASO 5: Verificación final
    syncResults.step5_verification.status = 'running'
    syncResults.step5_verification.message = 'Verificando sincronización...'

    try {
      const verification = await Promise.allSettled([
        supabaseAdmin.from('users').select('count', { count: 'exact' }),
        supabaseAdmin.from('products').select('count', { count: 'exact' }),
        supabaseAdmin.from('products').select('count', { count: 'exact' }).eq('is_featured', true)
      ])

      const counts = {
        users: verification[0].status === 'fulfilled' ? verification[0].value.count : 0,
        products: verification[1].status === 'fulfilled' ? verification[1].value.count : 0,
        featured: verification[2].status === 'fulfilled' ? verification[2].value.count : 0
      }

      syncResults.step5_verification.status = 'completed'
      syncResults.step5_verification.message = `Verificación completa: ${counts.users} usuarios, ${counts.products} productos, ${counts.featured} destacados`
      syncResults.step5_verification.details = counts

    } catch (error) {
      syncResults.step5_verification.status = 'error'
      syncResults.step5_verification.message = `Error en verificación: ${error.message}`
    }

    // Determinar éxito general
    const allCompleted = Object.values(syncResults).every(step => 
      step.status === 'completed' || step.status === 'partial'
    )

    res.status(200).json({
      success: allCompleted,
      message: allCompleted ? 'Sincronización completada exitosamente' : 'Sincronización completada con algunos errores',
      results: syncResults,
      nextSteps: [
        'Tu proyecto ahora está sincronizado con Supabase',
        'Puedes acceder a los datos desde: https://app.supabase.com/project/koqjdrfhegaenecgnowx/editor',
        'Las API routes ahora pueden usar las funciones de supabaseDb.js'
      ]
    })

  } catch (error) {
    console.error('Synchronization failed:', error)
    res.status(500).json({
      success: false,
      error: 'Synchronization failed',
      details: error.message
    })
  }
}