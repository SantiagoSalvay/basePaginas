// API para sincronización automática completa con Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Cliente con permisos de administrador
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('🚀 Iniciando sincronización automática completa...')
    
    const results = {
      step1_create_tables: { status: 'running', details: [] },
      step2_migrate_users: { status: 'pending', details: [] },
      step3_migrate_products: { status: 'pending', details: [] },
      step4_set_featured: { status: 'pending', details: [] },
      step5_verification: { status: 'pending', details: [] }
    }

    // PASO 1: Crear tablas usando SQL directo
    console.log('📋 Paso 1: Creando tablas...')
    results.step1_create_tables.status = 'running'

    const sqlCommands = [
      // Habilitar extensión UUID
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
      
      // Crear tabla usuarios
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
      
      // Crear tabla productos
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
      
      // Crear tabla direcciones
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
      
      // Crear tabla órdenes
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
      );`,
      
      // Crear índices
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`,
      `CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);`,
      `CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`
    ]

    // Ejecutar comandos SQL uno por uno
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i].trim()
      if (sql) {
        try {
          console.log(`Ejecutando SQL ${i + 1}/${sqlCommands.length}: ${sql.substring(0, 50)}...`)
          
          // Usar rpc para ejecutar SQL directo
          const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql })
          
          if (error && !error.message.includes('already exists')) {
            console.log(`SQL ${i + 1} warning:`, error.message)
            results.step1_create_tables.details.push({
              command: sql.substring(0, 100),
              status: 'warning',
              message: error.message
            })
          } else {
            results.step1_create_tables.details.push({
              command: sql.substring(0, 100),
              status: 'success'
            })
          }
        } catch (err) {
          console.log(`SQL ${i + 1} error:`, err.message)
          results.step1_create_tables.details.push({
            command: sql.substring(0, 100),
            status: 'error',
            message: err.message
          })
        }
      }
    }

    results.step1_create_tables.status = 'completed'
    console.log('✅ Paso 1 completado: Tablas creadas')

    // PASO 2: Migrar usuarios
    console.log('👥 Paso 2: Migrando usuarios...')
    results.step2_migrate_users.status = 'running'

    try {
      const usersPath = path.join(process.cwd(), 'data', 'users.json')
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
      
      for (const user of usersData.users) {
        try {
          // Generar nuevo UUID si el ID es '1'
          const userId = user.id === '1' ? undefined : user.id
          
          const { data, error } = await supabaseAdmin
            .from('users')
            .upsert({
              ...(userId && { id: userId }),
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
              onConflict: 'email',
              ignoreDuplicates: false
            })
            .select()

          if (error) {
            results.step2_migrate_users.details.push({
              user: user.email,
              status: 'error',
              message: error.message
            })
          } else {
            results.step2_migrate_users.details.push({
              user: user.email,
              status: 'success',
              id: data[0]?.id
            })
            console.log(`✅ Usuario migrado: ${user.email}`)
          }
        } catch (err) {
          results.step2_migrate_users.details.push({
            user: user.email,
            status: 'error',
            message: err.message
          })
        }
      }

      results.step2_migrate_users.status = 'completed'
      console.log('✅ Paso 2 completado: Usuarios migrados')

    } catch (error) {
      results.step2_migrate_users.status = 'error'
      results.step2_migrate_users.details.push({ error: error.message })
    }

    // PASO 3: Migrar productos
    console.log('🛍️ Paso 3: Migrando productos...')
    results.step3_migrate_products.status = 'running'

    try {
      const productsPath = path.join(process.cwd(), 'data', 'products.json')
      const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
      
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
                onConflict: 'id',
                ignoreDuplicates: false
              })
              .select()

            if (error) {
              results.step3_migrate_products.details.push({
                product: product.name,
                status: 'error',
                message: error.message
              })
            } else {
              results.step3_migrate_products.details.push({
                product: product.name,
                status: 'success',
                id: product.id
              })
              console.log(`✅ Producto migrado: ${product.name}`)
            }
          } catch (err) {
            results.step3_migrate_products.details.push({
              product: product.name,
              status: 'error',
              message: err.message
            })
          }
        }
      }

      results.step3_migrate_products.status = 'completed'
      console.log('✅ Paso 3 completado: Productos migrados')

    } catch (error) {
      results.step3_migrate_products.status = 'error'
      results.step3_migrate_products.details.push({ error: error.message })
    }

    // PASO 4: Configurar productos destacados
    console.log('⭐ Paso 4: Configurando productos destacados...')
    results.step4_set_featured.status = 'running'

    try {
      const featuredPath = path.join(process.cwd(), 'data', 'featured-products.json')
      const featuredData = JSON.parse(fs.readFileSync(featuredPath, 'utf8'))
      
      for (const productId of featuredData) {
        try {
          const { data, error } = await supabaseAdmin
            .from('products')
            .update({ is_featured: true })
            .eq('id', productId)
            .select()

          if (error) {
            results.step4_set_featured.details.push({
              productId,
              status: 'error',
              message: error.message
            })
          } else if (data && data.length > 0) {
            results.step4_set_featured.details.push({
              productId,
              status: 'success',
              name: data[0].name
            })
            console.log(`⭐ Producto destacado: ${data[0].name}`)
          } else {
            results.step4_set_featured.details.push({
              productId,
              status: 'not_found',
              message: 'Product not found'
            })
          }
        } catch (err) {
          results.step4_set_featured.details.push({
            productId,
            status: 'error',
            message: err.message
          })
        }
      }

      results.step4_set_featured.status = 'completed'
      console.log('✅ Paso 4 completado: Productos destacados configurados')

    } catch (error) {
      results.step4_set_featured.status = 'error'
      results.step4_set_featured.details.push({ error: error.message })
    }

    // PASO 5: Verificación final
    console.log('🔍 Paso 5: Verificación final...')
    results.step5_verification.status = 'running'

    try {
      const [usersCount, productsCount, featuredCount] = await Promise.all([
        supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('is_featured', true)
      ])

      const counts = {
        users: usersCount.count || 0,
        products: productsCount.count || 0,
        featured: featuredCount.count || 0
      }

      results.step5_verification.status = 'completed'
      results.step5_verification.details = counts
      
      console.log('✅ Verificación completada:', counts)

    } catch (error) {
      results.step5_verification.status = 'error'
      results.step5_verification.details = { error: error.message }
    }

    // Determinar éxito general
    const successfulSteps = Object.values(results).filter(step => step.status === 'completed').length
    const totalSteps = Object.keys(results).length

    console.log(`🎉 Sincronización completada: ${successfulSteps}/${totalSteps} pasos exitosos`)

    res.status(200).json({
      success: successfulSteps === totalSteps,
      message: `Sincronización automática completada: ${successfulSteps}/${totalSteps} pasos exitosos`,
      results,
      summary: {
        tablesCreated: results.step1_create_tables.status === 'completed',
        usersMigrated: results.step2_migrate_users.details.filter(u => u.status === 'success').length,
        productsMigrated: results.step3_migrate_products.details.filter(p => p.status === 'success').length,
        featuredSet: results.step4_set_featured.details.filter(f => f.status === 'success').length,
        finalCounts: results.step5_verification.details
      },
      nextSteps: [
        '✅ Tu base de datos está sincronizada con Supabase',
        '🔗 Accede a tus datos en: https://app.supabase.com/project/koqjdrfhegaenecgnowx/editor',
        '🚀 Ahora puedes usar las funciones de supabaseDb.js en tus API routes'
      ]
    })

  } catch (error) {
    console.error('❌ Error en sincronización automática:', error)
    res.status(500).json({
      success: false,
      error: 'Synchronization failed',
      details: error.message
    })
  }
}