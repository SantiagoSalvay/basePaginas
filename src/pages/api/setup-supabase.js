// API para configurar las tablas de Supabase directamente
import { supabaseAdmin } from '../../utils/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Setting up Supabase tables...')
    const results = []

    // 1. Crear tabla de usuarios
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1)

      if (error && error.code === 'PGRST116') {
        // La tabla no existe, necesitamos crearla manualmente
        results.push({ step: 'users_table', status: 'Table needs to be created manually in Supabase Dashboard' })
      } else {
        results.push({ step: 'users_table', status: 'exists', error: error?.message })
      }
    } catch (err) {
      results.push({ step: 'users_table', status: 'error', error: err.message })
    }

    // 2. Crear tabla de productos
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('count')
        .limit(1)

      if (error && error.code === 'PGRST116') {
        results.push({ step: 'products_table', status: 'Table needs to be created manually in Supabase Dashboard' })
      } else {
        results.push({ step: 'products_table', status: 'exists', error: error?.message })
      }
    } catch (err) {
      results.push({ step: 'products_table', status: 'error', error: err.message })
    }

    // 3. Crear tabla de órdenes
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('count')
        .limit(1)

      if (error && error.code === 'PGRST116') {
        results.push({ step: 'orders_table', status: 'Table needs to be created manually in Supabase Dashboard' })
      } else {
        results.push({ step: 'orders_table', status: 'exists', error: error?.message })
      }
    } catch (err) {
      results.push({ step: 'orders_table', status: 'error', error: err.message })
    }

    // 4. Crear tabla de direcciones
    try {
      const { data, error } = await supabaseAdmin
        .from('user_addresses')
        .select('count')
        .limit(1)

      if (error && error.code === 'PGRST116') {
        results.push({ step: 'user_addresses_table', status: 'Table needs to be created manually in Supabase Dashboard' })
      } else {
        results.push({ step: 'user_addresses_table', status: 'exists', error: error?.message })
      }
    } catch (err) {
      results.push({ step: 'user_addresses_table', status: 'error', error: err.message })
    }

    const needsManualSetup = results.some(r => r.status === 'Table needs to be created manually in Supabase Dashboard')

    if (needsManualSetup) {
      return res.status(200).json({
        success: false,
        message: 'Tables need to be created manually in Supabase Dashboard',
        instructions: {
          step1: 'Go to your Supabase Dashboard',
          step2: 'Navigate to SQL Editor',
          step3: 'Execute the content of supabase-migration.sql file',
          step4: 'Then run this API again to verify'
        },
        sqlFile: 'Use the content from supabase-migration.sql',
        results
      })
    }

    res.status(200).json({
      success: true,
      message: 'All tables exist and are ready for data migration',
      results
    })

  } catch (error) {
    console.error('Setup failed:', error)
    res.status(500).json({
      success: false,
      error: 'Setup failed',
      details: error.message
    })
  }
}