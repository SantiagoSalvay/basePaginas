import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Headers de seguridad
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('X-Content-Type-Options', 'nosniff')
    requestHeaders.set('X-Frame-Options', 'DENY')
    requestHeaders.set('X-XSS-Protection', '1; mode=block')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
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