// API para migrar los datos existentes de JSON a Supabase
import { supabaseAdmin } from '../../utils/supabase'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Starting data migration...')
    const results = {
      users: { success: 0, errors: 0, details: [] },
      products: { success: 0, errors: 0, details: [] },
      featuredProducts: { success: 0, errors: 0, details: [] }
    }

    // 1. Migrar usuarios
    try {
      const usersPath = path.join(process.cwd(), 'data', 'users.json')
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
      
      console.log('Migrating users...')
      for (const user of usersData.users) {
        try {
          const userData = {
            id: user.id === '1' ? null : user.id, // Dejar que UUID se genere automáticamente para ID '1'
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

          const { data, error } = await supabaseAdmin
            .from('users')
            .upsert(userData, { 
              onConflict: 'email',
              ignoreDuplicates: false 
            })
            .select()

          if (error) {
            console.error('Error inserting user:', error)
            results.users.errors++
            results.users.details.push({ user: user.email, error: error.message })
          } else {
            console.log('User migrated:', user.email)
            results.users.success++
            results.users.details.push({ user: user.email, status: 'success' })
          }
        } catch (err) {
          console.error('Error processing user:', err)
          results.users.errors++
          results.users.details.push({ user: user.email, error: err.message })
        }
      }
    } catch (err) {
      console.error('Error reading users file:', err)
      results.users.details.push({ error: 'Could not read users.json file' })
    }

    // 2. Migrar productos
    try {
      const productsPath = path.join(process.cwd(), 'data', 'products.json')
      const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
      
      console.log('Migrating products...')
      
      // Procesar productos por categoría
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
              is_featured: false, // Lo actualizaremos después con featured-products.json
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
              console.error('Error inserting product:', error)
              results.products.errors++
              results.products.details.push({ product: product.name, error: error.message })
            } else {
              console.log('Product migrated:', product.name)
              results.products.success++
              results.products.details.push({ product: product.name, status: 'success' })
            }
          } catch (err) {
            console.error('Error processing product:', err)
            results.products.errors++
            results.products.details.push({ product: product.name, error: err.message })
          }
        }
      }
    } catch (err) {
      console.error('Error reading products file:', err)
      results.products.details.push({ error: 'Could not read products.json file' })
    }

    // 3. Actualizar productos destacados
    try {
      const featuredPath = path.join(process.cwd(), 'data', 'featured-products.json')
      const featuredData = JSON.parse(fs.readFileSync(featuredPath, 'utf8'))
      
      console.log('Updating featured products...')
      
      for (const productId of featuredData) {
        try {
          const { data, error } = await supabaseAdmin
            .from('products')
            .update({ is_featured: true })
            .eq('id', productId)
            .select()

          if (error) {
            console.error('Error updating featured product:', error)
            results.featuredProducts.errors++
            results.featuredProducts.details.push({ productId, error: error.message })
          } else if (data && data.length > 0) {
            console.log('Featured product updated:', productId)
            results.featuredProducts.success++
            results.featuredProducts.details.push({ productId, status: 'success' })
          } else {
            results.featuredProducts.errors++
            results.featuredProducts.details.push({ productId, error: 'Product not found' })
          }
        } catch (err) {
          console.error('Error processing featured product:', err)
          results.featuredProducts.errors++
          results.featuredProducts.details.push({ productId, error: err.message })
        }
      }
    } catch (err) {
      console.error('Error reading featured products file:', err)
      results.featuredProducts.details.push({ error: 'Could not read featured-products.json file' })
    }

    // Resumen final
    const summary = {
      users: `${results.users.success} migrated, ${results.users.errors} errors`,
      products: `${results.products.success} migrated, ${results.products.errors} errors`,
      featuredProducts: `${results.featuredProducts.success} updated, ${results.featuredProducts.errors} errors`
    }

    console.log('Migration completed:', summary)

    res.status(200).json({
      success: true,
      message: 'Data migration completed',
      summary,
      details: results
    })

  } catch (error) {
    console.error('Data migration failed:', error)
    res.status(500).json({
      success: false,
      error: 'Data migration failed',
      details: error.message
    })
  }
}