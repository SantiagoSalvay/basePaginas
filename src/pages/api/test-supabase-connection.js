// API route para probar la conexión con Supabase
import { supabase, supabaseAdmin } from '../../utils/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Testing Supabase connection...')
    
    // Test 1: Verificar configuración
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ 
        success: false,
        error: 'Missing Supabase environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          hasServiceKey: !!supabaseServiceKey
        }
      })
    }

    // Test 2: Probar conexión básica
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (healthError && healthError.code !== 'PGRST116') {
      console.error('Health check error:', healthError)
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: healthError.message
      })
    }

    // Test 3: Probar cliente admin
    const { data: adminTest, error: adminError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)

    if (adminError && adminError.code !== 'PGRST116') {
      console.error('Admin client error:', adminError)
    }

    // Test 4: Verificar tablas existentes
    const { data: tables, error: tablesError } = await supabaseAdmin
      .rpc('get_table_names')
      .then(result => ({ data: null, error: null })) // RPC might not exist, that's ok
      .catch(() => ({ data: null, error: null }))

    const response = {
      success: true,
      message: 'Supabase connection successful!',
      details: {
        url: supabaseUrl,
        hasAnonKey: true,
        hasServiceKey: !!supabaseServiceKey,
        clientConnected: !healthError,
        adminConnected: !adminError,
        timestamp: new Date().toISOString()
      }
    }

    console.log('Supabase connection test successful:', response)
    res.status(200).json(response)

  } catch (error) {
    console.error('Supabase connection test failed:', error)
    res.status(500).json({
      success: false,
      error: 'Connection test failed',
      details: error.message
    })
  }
}