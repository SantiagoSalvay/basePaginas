// API para sincronización completa usando solo Supabase REST API
import { supabaseAdmin } from '../../utils/supabase'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('🚀 Iniciando sincronización completa...')
    
    const results = {
      step1_test_connection: { status: 'running', details: [] },
      step2_migrate_users: { status: 'pending', details: [] },
      step3_migrate_products: { status: 'pending', details: [] },
      step4_set_featured: { status: 'pending', details: [] },
      step5_verification: { status: 'pending', details: [] }
    }

    // PASO 1: Probar conexión y crear datos de prueba para forzar la creación de tablas
    console.log('🔗 Paso 1: Probando conexión y creando estructura...')
    results.step1_test_connection.status = 'running'

    // Intentar crear un usuario de prueba para forzar la creación de la tabla
    try {
      const testUser = {
        name: 'Test User Setup',
        email: 'setup@test.com',
        password: 'temp_password',
        role: 'user',
        email_verified: false
      }

      // Esto debería fallar si la tabla no existe, pero nos dará información
      const { data: testUserData, error: testUserError } = await supabaseAdmin
        .from('users')
        .insert([testUser])
        .select()

      if (testUserError) {
        results.step1_test_connection.details.push({
          action: 'create_test_user',
          status: 'error',
          error: testUserError.message
        })
        
        // Si la tabla no existe, necesitamos crearla manualmente
        if (testUserError.message.includes('does not exist') || testUserError.message.includes('schema cache')) {
          results.step1_test_connection.status = 'tables_needed'
          
          return res.status(200).json({
            success: false,
            message: 'Las tablas necesitan ser creadas manualmente en Supabase Dashboard',
            step_completed: 'connection_test',
            error_type: 'tables_not_exist',
            instructions: {
              step1: 'Ve a https://app.supabase.com/project/koqjdrfhegaenecgnowx/sql',
              step2: 'Ejecuta el siguiente script SQL:',
              sql_script: `-- Crear extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla usuarios
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

-- Crear tabla productos
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

-- Crear tabla direcciones de usuarios
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

-- Crear tabla órdenes
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
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`,
              step3: 'Después de ejecutar el SQL, vuelve a llamar esta API'
            },
            results
          })
        }
      } else {
        // Si el usuario se creó exitosamente, elimínalo
        await supabaseAdmin.from('users').delete().eq('email', 'setup@test.com')
        results.step1_test_connection.details.push({
          action: 'create_test_user',
          status: 'success',
          message: 'Tabla users existe y funciona'
        })
      }
    } catch (err) {
      results.step1_test_connection.details.push({
        action: 'connection_test',
        status: 'error',
        error: err.message
      })
    }

    // Probar tabla products
    try {
      const { data: testProductData, error: testProductError } = await supabaseAdmin
        .from('products')
        .select('id')
        .limit(1)

      if (testProductError) {
        results.step1_test_connection.details.push({
          action: 'test_products_table',
          status: 'error',
          error: testProductError.message
        })
      } else {
        results.step1_test_connection.details.push({
          action: 'test_products_table',
          status: 'success',
          message: 'Tabla products existe'
        })
      }
    } catch (err) {
      results.step1_test_connection.details.push({
        action: 'test_products_table',
        status: 'error',
        error: err.message
      })
    }

    results.step1_test_connection.status = 'completed'

    // PASO 2: Migrar usuarios
    console.log('👥 Paso 2: Migrando usuarios...')
    results.step2_migrate_users.status = 'running'

    try {
      const usersPath = path.join(process.cwd(), 'data', 'users.json')
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
      
      for (const user of usersData.users) {
        try {
          const userData = {
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
          }

          // Si el ID original es '1', no lo incluimos para que se genere automáticamente
          if (user.id !== '1') {
            userData.id = user.id
          }

          const { data, error } = await supabaseAdmin
            .from('users')
            .upsert(userData, { 
              onConflict: 'email',
              ignoreDuplicates: false 
            })
            .select()

          if (error) {
            results.step2_migrate_users.details.push({
              email: user.email,
              status: 'error',
              error: error.message
            })
            console.log(`❌ Error usuario ${user.email}:`, error.message)
          } else {
            results.step2_migrate_users.details.push({
              email: user.email,
              status: 'success',
              id: data[0]?.id
            })
            console.log(`✅ Usuario migrado: ${user.email}`)
          }
        } catch (err) {
          results.step2_migrate_users.details.push({
            email: user.email,
            status: 'error',
            error: err.message
          })
        }
      }

      results.step2_migrate_users.status = 'completed'

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
            const productData = {
              id: product.id,
              name: product.name,
              description: `Producto de la categoría ${category}`,
              price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
              category: product.category || category,
              image_url: product.image,
              stock: product.stock || 10,
              is_featured: false,
              created_at: new Date().toISOString()
            }

            const { data, error } = await supabaseAdmin
              .from('products')
              .upsert(productData, { 
                onConflict: 'id',
                ignoreDuplicates: false 
              })
              .select()

            if (error) {
              results.step3_migrate_products.details.push({
                name: product.name,
                status: 'error',
                error: error.message
              })
              console.log(`❌ Error producto ${product.name}:`, error.message)
            } else {
              results.step3_migrate_products.details.push({
                name: product.name,
                status: 'success',
                id: product.id
              })
              console.log(`✅ Producto migrado: ${product.name}`)
            }
          } catch (err) {
            results.step3_migrate_products.details.push({
              name: product.name,
              status: 'error',
              error: err.message
            })
          }
        }
      }

      results.step3_migrate_products.status = 'completed'

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
              id: productId,
              status: 'error',
              error: error.message
            })
          } else if (data && data.length > 0) {
            results.step4_set_featured.details.push({
              id: productId,
              status: 'success',
              name: data[0].name
            })
            console.log(`⭐ Producto destacado: ${data[0].name}`)
          } else {
            results.step4_set_featured.details.push({
              id: productId,
              status: 'not_found'
            })
          }
        } catch (err) {
          results.step4_set_featured.details.push({
            id: productId,
            status: 'error',
            error: err.message
          })
        }
      }

      results.step4_set_featured.status = 'completed'

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
      
      console.log('📊 Conteos finales:', counts)

    } catch (error) {
      results.step5_verification.status = 'error'
      results.step5_verification.details = { error: error.message }
    }

    // Calcular estadísticas de éxito
    const usersSuccess = results.step2_migrate_users.details.filter(u => u.status === 'success').length
    const productsSuccess = results.step3_migrate_products.details.filter(p => p.status === 'success').length
    const featuredSuccess = results.step4_set_featured.details.filter(f => f.status === 'success').length

    console.log(`🎉 Sincronización completada!`)
    console.log(`📊 ${usersSuccess} usuarios, ${productsSuccess} productos, ${featuredSuccess} destacados`)

    res.status(200).json({
      success: true,
      message: `🎉 ¡Sincronización completada exitosamente!`,
      summary: {
        users_migrated: usersSuccess,
        products_migrated: productsSuccess,
        featured_products: featuredSuccess,
        final_counts: results.step5_verification.details
      },
      detailed_results: results,
      next_steps: [
        '✅ Tu base de datos está completamente sincronizada con Supabase',
        '🔗 Accede a tus datos: https://app.supabase.com/project/koqjdrfhegaenecgnowx/editor',
        '🚀 Usa las funciones de supabaseDb.js en tus API routes',
        '🧪 Prueba la conexión: /api/test-supabase-connection'
      ]
    })

  } catch (error) {
    console.error('❌ Error en sincronización completa:', error)
    
    res.status(500).json({
      success: false,
      error: 'Synchronization failed',
      details: error.message,
      stack: error.stack
    })
  }
}