// src/utils/supabaseDb.js
// Este archivo reemplaza la funcionalidad de dbServer.js usando Supabase
import { supabase, supabaseAdmin, getSupabaseClient } from './supabase'
import { v4 as uuidv4 } from 'uuid'

// Función para ejecutar consultas con manejo de errores
const handleSupabaseError = (error, operation) => {
  console.error(`Error en ${operation}:`, error)
  throw new Error(`Database ${operation} failed: ${error.message}`)
}

// USUARIOS
export const createUser = async (userData) => {
  try {
    const userId = uuidv4()
    // Filtrar campos undefined o null para evitar errores de restricción
    const userToInsert = {
      id: userId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || null,
      role: userData.role || 'user',
      email_verified: userData.email_verified || false,
      verification_token: userData.verification_token || null,
      reset_token: userData.reset_token || null,
      reset_token_expires: userData.reset_token_expires || null
    };

    // Solo incluir contraseña si existe
    if (userData.password) {
      userToInsert.password = userData.password;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([userToInsert])
      .select()
      .single()

    if (error) handleSupabaseError(error, 'createUser')
    return data
  } catch (error) {
    handleSupabaseError(error, 'createUser')
  }
}

export const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      handleSupabaseError(error, 'getUserByEmail')
    }

    return data
  } catch (error) {
    handleSupabaseError(error, 'getUserByEmail')
  }
}

export const getUserById = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getUserById')
    }

    return data
  } catch (error) {
    handleSupabaseError(error, 'getUserById')
  }
}

export const getUserByResetToken = async (token) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .single()

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getUserByResetToken')
    }

    return data
  } catch (error) {
    handleSupabaseError(error, 'getUserByResetToken')
  }
}


export const updateUser = async (id, updateData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) handleSupabaseError(error, 'updateUser')
    return data
  } catch (error) {
    handleSupabaseError(error, 'updateUser')
  }
}

export const verifyUserEmail = async (token) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        updated_at: new Date().toISOString()
      })
      .eq('verification_token', token)
      .select()
      .single()

    if (error) handleSupabaseError(error, 'verifyUserEmail')
    return data
  } catch (error) {
    handleSupabaseError(error, 'verifyUserEmail')
  }
}

// DIRECCIONES DE USUARIO
export const createUserAddress = async (addressData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_addresses')
      .insert([{
        user_id: addressData.user_id,
        name: addressData.name,
        email: addressData.email,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postal_code,
        phone: addressData.phone,
        is_default: addressData.is_default || false
      }])
      .select()
      .single()

    if (error) handleSupabaseError(error, 'createUserAddress')
    return data
  } catch (error) {
    handleSupabaseError(error, 'createUserAddress')
  }
}

export const getUserAddresses = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) handleSupabaseError(error, 'getUserAddresses')
    return data || []
  } catch (error) {
    handleSupabaseError(error, 'getUserAddresses')
  }
}

// ÓRDENES
export const createOrder = async (orderData) => {
  try {
    const orderId = uuidv4()
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        id: orderId,
        user_id: orderData.user_id,
        total_amount: orderData.total_amount,
        currency: orderData.currency || 'USD',
        status: orderData.status || 'pending',
        payment_method: orderData.payment_method || 'pending',
        payment_status: orderData.payment_status || 'pending',
        shipping_address: orderData.shipping_address,
        items: orderData.items,
        discount_applied: orderData.discount_applied || 0,
        receipt_image: orderData.receipt_image || null
      }])
      .select()
      .single()

    if (error) handleSupabaseError(error, 'createOrder')
    return data
  } catch (error) {
    handleSupabaseError(error, 'createOrder')
  }
}

export const getOrderById = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'getOrderById')
    }

    return data
  } catch (error) {
    handleSupabaseError(error, 'getOrderById')
  }
}

export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) handleSupabaseError(error, 'getUserOrders')
    return data || []
  } catch (error) {
    handleSupabaseError(error, 'getUserOrders')
  }
}

export const getAllOrders = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) handleSupabaseError(error, 'getAllOrders')
    return data || []
  } catch (error) {
    handleSupabaseError(error, 'getAllOrders')
  }
}

export const updateOrderStatus = async (id, status, paymentStatus = null) => {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    }

    if (paymentStatus) {
      updateData.payment_status = paymentStatus
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) handleSupabaseError(error, 'updateOrderStatus')
    return data
  } catch (error) {
    handleSupabaseError(error, 'updateOrderStatus')
  }
}

// FUNCIÓN DE INICIALIZACIÓN (crear tablas si no existen)
export const initSupabaseDatabase = async () => {
  try {
    console.log('Supabase database initialized - tables should be created via Supabase Dashboard or migrations')
    return true
  } catch (error) {
    console.error('Error initializing Supabase database:', error)
    throw error
  }
}

// Función de compatibilidad para transacciones (Supabase maneja esto automáticamente)
export const beginTransaction = async () => {
  console.log('Supabase handles transactions automatically')
  return true
}

export const commitTransaction = async () => {
  console.log('Supabase handles transactions automatically')
  return true
}

export const rollbackTransaction = async () => {
  console.log('Supabase handles transactions automatically')
  return true
}

// Función genérica para consultas personalizadas
export const query = async (table, operation, data = null, filters = {}) => {
  try {
    let queryBuilder = supabaseAdmin.from(table)

    switch (operation) {
      case 'select':
        queryBuilder = queryBuilder.select(data || '*')
        break
      case 'insert':
        queryBuilder = queryBuilder.insert(data).select()
        break
      case 'update':
        queryBuilder = queryBuilder.update(data).select()
        break
      case 'delete':
        queryBuilder = queryBuilder.delete()
        break
      default:
        throw new Error(`Unsupported operation: ${operation}`)
    }

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value)
    })

    const { data: result, error } = await queryBuilder

    if (error) handleSupabaseError(error, `${operation} on ${table}`)
    return result
  } catch (error) {
    handleSupabaseError(error, `query ${operation} on ${table}`)
  }
}