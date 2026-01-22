import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Cliente público de Supabase (para el frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente con rol de servicio (para operaciones administrativas en el backend)
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Función para obtener el cliente apropiado según el contexto
export const getSupabaseClient = (isServer = false) => {
  if (isServer && supabaseServiceRoleKey) {
    return supabaseAdmin
  }
  return supabase
}

export default supabase