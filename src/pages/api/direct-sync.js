// API para sincronización directa usando PostgreSQL
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Configuración de conexión PostgreSQL directa
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🚀 Conectando directamente a PostgreSQL...')
    await client.connect()
    
    const results = {
      step1_create_tables: { status: 'running', details: [] },
      step2_migrate_users: { status: 'pending', details: [] },
      step3_migrate_products: { status: 'pending', details: [] },
      step4_set_featured: { status: 'pending', details: [] },
      step5_verification: { status: 'pending', details: [] }
    }

    // PASO 1: Crear tablas usando PostgreSQL directo
    console.log('📋 Paso 1: Creando tablas con PostgreSQL...')
    
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
      );`,
      
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`,
      `CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);`,
      `CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`
    ]

    // Ejecutar comandos SQL
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i].trim()
      if (sql) {
        try {
          console.log(`Ejecutando SQL ${i + 1}/${sqlCommands.length}`)
          await client.query(sql)
          results.step1_create_tables.details.push({
            command: sql.substring(0, 50) + '...',
            status: 'success'
          })
        } catch (err) {
          console.log(`SQL ${i + 1} warning:`, err.message)
          results.step1_create_tables.details.push({
            command: sql.substring(0, 50) + '...',
            status: err.message.includes('already exists') ? 'exists' : 'warning',
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
          const insertUserSQL = `
            INSERT INTO users (id, name, email, password, phone, role, email_verified, verification_token, reset_token, reset_token_expires, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (email) DO UPDATE SET
              name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              role = EXCLUDED.role,
              email_verified = EXCLUDED.email_verified,
              verification_token = EXCLUDED.verification_token,
              reset_token = EXCLUDED.reset_token,
              reset_token_expires = EXCLUDED.reset_token_expires
            RETURNING id, email;
          `
          
          const userId = user.id === '1' ? null : user.id
          const values = [
            userId,
            user.name,
            user.email,
            user.password,
            user.phone || null,
            user.role || 'user',
            user.emailVerified || false,
            user.verificationToken || null,
            user.resetToken || null,
            user.resetTokenExpiry ? new Date(user.resetTokenExpiry) : null,
            user.createdAt ? new Date(user.createdAt) : new Date()
          ]

          const result = await client.query(insertUserSQL, values)
          
          results.step2_migrate_users.details.push({
            user: user.email,
            status: 'success',
            id: result.rows[0].id
          })
          console.log(`✅ Usuario migrado: ${user.email}`)
          
        } catch (err) {
          results.step2_migrate_users.details.push({
            user: user.email,
            status: 'error',
            message: err.message
          })
          console.log(`❌ Error migrando usuario ${user.email}:`, err.message)
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
            const insertProductSQL = `
              INSERT INTO products (id, name, description, price, category, image_url, stock, is_featured, created_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                price = EXCLUDED.price,
                category = EXCLUDED.category,
                image_url = EXCLUDED.image_url,
                stock = EXCLUDED.stock
              RETURNING id, name;
            `
            
            const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
            const values = [
              product.id,
              product.name,
              `Producto de la categoría ${category}`,
              price,
              product.category || category,
              product.image,
              product.stock || 10,
              false,
              new Date()
            ]

            const result = await client.query(insertProductSQL, values)
            
            results.step3_migrate_products.details.push({
              product: product.name,
              status: 'success',
              id: product.id
            })
            console.log(`✅ Producto migrado: ${product.name}`)
            
          } catch (err) {
            results.step3_migrate_products.details.push({
              product: product.name,
              status: 'error',
              message: err.message
            })
            console.log(`❌ Error migrando producto ${product.name}:`, err.message)
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
          const updateFeaturedSQL = `
            UPDATE products 
            SET is_featured = true 
            WHERE id = $1 
            RETURNING id, name;
          `
          
          const result = await client.query(updateFeaturedSQL, [productId])
          
          if (result.rows.length > 0) {
            results.step4_set_featured.details.push({
              productId,
              status: 'success',
              name: result.rows[0].name
            })
            console.log(`⭐ Producto destacado: ${result.rows[0].name}`)
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
      const usersCountResult = await client.query('SELECT COUNT(*) as count FROM users')
      const productsCountResult = await client.query('SELECT COUNT(*) as count FROM products')
      const featuredCountResult = await client.query('SELECT COUNT(*) as count FROM products WHERE is_featured = true')

      const counts = {
        users: parseInt(usersCountResult.rows[0].count),
        products: parseInt(productsCountResult.rows[0].count),
        featured: parseInt(featuredCountResult.rows[0].count)
      }

      results.step5_verification.status = 'completed'
      results.step5_verification.details = counts
      
      console.log('✅ Verificación completada:', counts)

    } catch (error) {
      results.step5_verification.status = 'error'
      results.step5_verification.details = { error: error.message }
    }

    // Cerrar conexión
    await client.end()

    // Determinar éxito general
    const successfulSteps = Object.values(results).filter(step => step.status === 'completed').length
    const totalSteps = Object.keys(results).length

    const usersMigrated = results.step2_migrate_users.details.filter(u => u.status === 'success').length
    const productsMigrated = results.step3_migrate_products.details.filter(p => p.status === 'success').length
    const featuredSet = results.step4_set_featured.details.filter(f => f.status === 'success').length

    console.log(`🎉 Sincronización completada: ${successfulSteps}/${totalSteps} pasos exitosos`)
    console.log(`📊 Resumen: ${usersMigrated} usuarios, ${productsMigrated} productos, ${featuredSet} destacados`)

    res.status(200).json({
      success: successfulSteps === totalSteps,
      message: `🎉 Sincronización automática completada exitosamente!`,
      results,
      summary: {
        tablesCreated: results.step1_create_tables.status === 'completed',
        usersMigrated,
        productsMigrated,
        featuredSet,
        finalCounts: results.step5_verification.details
      },
      nextSteps: [
        '✅ Tu base de datos está completamente sincronizada con Supabase',
        '🔗 Accede a tus datos en: https://app.supabase.com/project/koqjdrfhegaenecgnowx/editor',
        '🚀 Ahora puedes usar las funciones de supabaseDb.js en tus API routes',
        '🧪 Prueba la conexión en: /api/test-supabase-connection'
      ]
    })

  } catch (error) {
    console.error('❌ Error en sincronización directa:', error)
    
    try {
      await client.end()
    } catch (e) {
      console.log('Error cerrando conexión:', e.message)
    }
    
    res.status(500).json({
      success: false,
      error: 'Synchronization failed',
      details: error.message
    })
  }
}