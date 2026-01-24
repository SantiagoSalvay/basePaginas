import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Headers de seguridad mejorados
    const response = NextResponse.next()

    // Configuración CSP estricta
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

    response.headers.set('Content-Security-Policy', csp)
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '0')
    response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Proteger rutas de administración - REQUIERE ROL ADMIN
        if (pathname.startsWith('/admin')) {
          return token?.role === 'admin'
        }

        // Proteger APIs de administración - REQUIERE ROL ADMIN
        if (pathname.startsWith('/api/admin')) {
          return token?.role === 'admin'
        }

        // Proteger rutas de usuario - REQUIERE ESTAR LOGUEADO
        if (pathname.startsWith('/user') ||
          pathname.startsWith('/profile') ||
          pathname.startsWith('/checkout')) {
          return !!token
        }

        // Proteger APIs de usuario - REQUIERE ESTAR LOGUEADO
        if (pathname.startsWith('/api/user') ||
          pathname.startsWith('/api/orders') ||
          pathname.startsWith('/api/payment')) {
          return !!token
        }

        // Permitir acceso público a todo lo demás
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Solo proteger rutas específicas para evitar problemas de build
    '/admin/:path*',
    '/user/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/orders/:path*',
    '/api/payment/:path*',
  ],
}