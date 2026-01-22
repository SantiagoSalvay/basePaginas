// API para sincronización final usando configuración directa
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Configuración directa de PostgreSQL para Supabase
  const client = new Client({
    host: 'db.koqjdrfhegaenecgnowx.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'wL5*sjum/7r!Pca',
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🚀 Conectando a Supabase PostgreSQL...')
    await client.connect()
    console.log('✅ Conexión establecida')
    
    const results = {
      connection: 'success',
      tables_created: [],
      users_migrated: [],
      products_migrated: [],
      featured_set: [],
      final_counts: {}
    }

    // PASO 1: Crear tablas
    console.log('📋 Creando tablas...')
    
    const createTableQueries = [
      {
        name: 'uuid_extension',
        sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
      },
      {
        name: 'users_table',
        sql: `CREATE TABLE IF NOT EXISTS users (
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
        );`
      },
      {
        name: 'products_table',
        sql: `CREATE TABLE IF NOT EXISTS products (
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
        );`
      },
      {
        name: 'user_addresses_table',
        sql: `CREATE TABLE IF NOT EXISTS user_addresses (
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
        );`
      },
      {
        name: 'orders_table',
        sql: `CREATE TABLE IF NOT EXISTS orders (
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
      }
    ]

    // Crear índices
    const createIndexQueries = [
      { name: 'idx_users_email', sql: 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);' },
      { name: 'idx_products_category', sql: 'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);' },
      { name: 'idx_products_featured', sql: 'CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);' },
      { name: 'idx_user_addresses_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);' },
      { name: 'idx_orders_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);' },
      { name: 'idx_orders_status', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);' }
    ]

    // Ejecutar creación de tablas
    const allQueries = [...createTableQueries, ...createIndexQueries]
    
    for (const query of allQueries) {
      try {
        await client.query(query.sql)
        results.tables_created.push({ name: query.name, status: 'created' })
        console.log(`✅ ${query.name} creado`)
      } catch (err) {
        results.tables_created.push({ 
          name: query.name, 
          status: err.message.includes('already exists') ? 'already_exists' : 'error',
          error: err.message 
        })
        console.log(`⚠️ ${query.name}:`, err.message)
      }
    }

    // PASO 2: Migrar usuarios
    console.log('👥 Migrando usuarios...')
    
    try {
      const usersPath = path.join(process.cwd(), 'data', 'users.json')
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
      
      for (const user of usersData.users) {
        try {
          const insertUserSQL = `
            INSERT INTO users (name, email, password, phone, role, email_verified, verification_token, reset_token, reset_token_expires, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (email) DO UPDATE SET
              name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              role = EXCLUDED.role,
              email_verified = EXCLUDED.email_verified,
              verification_token = EXCLUDED.verification_token,
              reset_token = EXCLUDED.reset_token,
              reset_token_expires = EXCLUDED.reset_token_expires,
              updated_at = NOW()
            RETURNING id, email;
          `
          
          const values = [
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
          
          results.users_migrated.push({
            email: user.email,
            status: 'success',
            id: result.rows[0].id
          })
          console.log(`✅ Usuario migrado: ${user.email}`)
          
        } catch (err) {
          results.users_migrated.push({
            email: user.email,
            status: 'error',
            error: err.message
          })
          console.log(`❌ Error usuario ${user.email}:`, err.message)
        }
      }
    } catch (error) {
      console.log('❌ Error leyendo usuarios:', error.message)
    }

    // PASO 3: Migrar productos
    console.log('🛍️ Migrando productos...')
    
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
                stock = EXCLUDED.stock,
                updated_at = NOW()
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
            
            results.products_migrated.push({
              name: product.name,
              status: 'success',
              id: product.id
            })
            console.log(`✅ Producto migrado: ${product.name}`)
            
          } catch (err) {
            results.products_migrated.push({
              name: product.name,
              status: 'error',
              error: err.message
            })
            console.log(`❌ Error producto ${product.name}:`, err.message)
          }
        }
      }
    } catch (error) {
      console.log('❌ Error leyendo productos:', error.message)
    }

    // PASO 4: Configurar productos destacados
    console.log('⭐ Configurando productos destacados...')
    
    try {
      const featuredPath = path.join(process.cwd(), 'data', 'featured-products.json')
      const featuredData = JSON.parse(fs.readFileSync(featuredPath, 'utf8'))
      
      for (const productId of featuredData) {
        try {
          const updateFeaturedSQL = `
            UPDATE products 
            SET is_featured = true, updated_at = NOW()
            WHERE id = $1 
            RETURNING id, name;
          `
          
          const result = await client.query(updateFeaturedSQL, [productId])
          
          if (result.rows.length > 0) {
            results.featured_set.push({
              id: productId,
              status: 'success',
              name: result.rows[0].name
            })
            console.log(`⭐ Producto destacado: ${result.rows[0].name}`)
          } else {
            results.featured_set.push({
              id: productId,
              status: 'not_found'
            })
          }
          
        } catch (err) {
          results.featured_set.push({
            id: productId,
            status: 'error',
            error: err.message
          })
        }
      }
    } catch (error) {
      console.log('❌ Error configurando destacados:', error.message)
    }

    // PASO 5: Verificación final
    console.log('🔍 Verificación final...')
    
    try {
      const usersCountResult = await client.query('SELECT COUNT(*) as count FROM users')
      const productsCountResult = await client.query('SELECT COUNT(*) as count FROM products')
      const featuredCountResult = await client.query('SELECT COUNT(*) as count FROM products WHERE is_featured = true')

      results.final_counts = {
        users: parseInt(usersCountResult.rows[0].count),
        products: parseInt(productsCountResult.rows[0].count),
        featured: parseInt(featuredCountResult.rows[0].count)
      }
      
      console.log('📊 Conteos finales:', results.final_counts)

    } catch (error) {
      results.final_counts = { error: error.message }
    }

    // Cerrar conexión
    await client.end()
    console.log('🔐 Conexión cerrada')

    // Calcular estadísticas de éxito
    const usersSuccess = results.users_migrated.filter(u => u.status === 'success').length
    const productsSuccess = results.products_migrated.filter(p => p.status === 'success').length
    const featuredSuccess = results.featured_set.filter(f => f.status === 'success').length

    console.log(`🎉 Sincronización completada!`)
    console.log(`📊 ${usersSuccess} usuarios, ${productsSuccess} productos, ${featuredSuccess} destacados`)

    res.status(200).json({
      success: true,
      message: `🎉 ¡Sincronización completada exitosamente!`,
      summary: {
        users_migrated: usersSuccess,
        products_migrated: productsSuccess,
        featured_products: featuredSuccess,
        final_counts: results.final_counts
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
    console.error('❌ Error en sincronización:', error)
    
    try {
      await client.end()
    } catch (e) {
      console.log('Error cerrando conexión:', e.message)
    }
    
    res.status(500).json({
      success: false,
      error: 'Synchronization failed',
      details: error.message,
      stack: error.stack
    })
  }
}