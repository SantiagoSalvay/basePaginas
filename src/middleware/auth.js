// Middleware de autenticación y autorización seguro
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'
import { getUserByEmail } from '../utils/supabaseDb'
import DOMPurify from 'isomorphic-dompurify'

// Rate limiting simple (en producción usar Redis o similar)
const rateLimitMap = new Map()

export const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const now = Date.now()
    const windowStart = now - windowMs

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, [])
    }

    const requests = rateLimitMap.get(ip)
    const requestsInWindow = requests.filter(time => time > windowStart)

    if (requestsInWindow.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      })
    }

    requestsInWindow.push(now)
    rateLimitMap.set(ip, requestsInWindow)

    return next()
  }
}

// Verificar autenticación
export const requireAuth = async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      return {
        success: false,
        status: 401,
        error: 'Authentication required'
      }
    }

    // Obtener datos completos del usuario desde Supabase
    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return {
        success: false,
        status: 401,
        error: 'User not found'
      }
    }

    return {
      success: true,
      session,
      user
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return {
      success: false,
      status: 500,
      error: 'Authentication error'
    }
  }
}

// Verificar rol de administrador
export const requireAdmin = async (req, res) => {
  const authResult = await requireAuth(req, res)

  if (!authResult.success) {
    return authResult
  }

  if (authResult.user.role !== 'admin') {
    return {
      success: false,
      status: 403,
      error: 'Admin access required'
    }
  }

  return authResult
}

// Validar entrada de datos
export const validateInput = (schema) => {
  return (data) => {
    const errors = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]

      if (rules.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field} is required`)
        continue
      }

      if (value && rules.type) {
        if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${field} must be a valid email`)
        }

        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} must be a string`)
        }

        if (rules.type === 'number' && isNaN(Number(value))) {
          errors.push(`${field} must be a number`)
        }

        if (rules.type === 'uuid' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
          errors.push(`${field} must be a valid UUID`)
        }
      }

      if (value && rules.minLength && value.toString().length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`)
      }

      if (value && rules.maxLength && value.toString().length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`)
      }

      if (value && rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Sanitizar entrada HTML de forma robusta
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input

  // Usar DOMPurify para limpiar HTML malicioso (XSS)
  // Configuración estricta: No permitir etiquetas por defecto para inputs simples
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No permitir NINGUNA etiqueta HTML
    ALLOWED_ATTR: []
  }).trim()
}

// Verificar propiedad de recursos (Mitigación IDOR)
export const checkOwnership = (resourceUserId, session) => {
  if (!session || !session.user) return false
  if (session.user.role === 'admin') return true
  return resourceUserId === session.user.id
}

// Headers de seguridad modernos
export const securityHeaders = (res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '0') // Desactivado ya que CSP hace el trabajo
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')

  // Content Security Policy (CSP) base
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://accounts.google.com;
    frame-src 'self' https://accounts.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim()

  res.setHeader('Content-Security-Policy', csp)

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }
}

// Wrapper para APIs protegidas
export const withAuth = (handler, options = {}) => {
  return async (req, res) => {
    try {
      // Aplicar headers de seguridad
      securityHeaders(res)

      // Aplicar rate limiting si está habilitado
      if (options.rateLimit) {
        const rateLimitResult = rateLimit(options.rateLimit.windowMs, options.rateLimit.maxRequests)
        await new Promise((resolve, reject) => {
          rateLimitResult(req, res, (err) => {
            if (err) reject(err)
            else resolve()
          })
        })
      }

      // Verificar autenticación
      const authResult = options.requireAdmin
        ? await requireAdmin(req, res)
        : await requireAuth(req, res)

      if (!authResult.success) {
        return res.status(authResult.status).json({
          success: false,
          error: authResult.error
        })
      }

      // Validar entrada si se proporciona esquema
      if (options.validation && req.body) {
        const validation = validateInput(options.validation)
        const result = validation(req.body)

        if (!result.isValid) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: result.errors
          })
        }

        // Sanitizar inputs
        for (const key in req.body) {
          if (typeof req.body[key] === 'string') {
            req.body[key] = sanitizeInput(req.body[key])
          }
        }
      }

      // Agregar usuario a la request
      req.user = authResult.user
      req.session = authResult.session

      // Ejecutar handler original
      return await handler(req, res)

    } catch (error) {
      console.error('Middleware error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}

export default {
  requireAuth,
  requireAdmin,
  validateInput,
  sanitizeInput,
  securityHeaders,
  withAuth,
  rateLimit
}