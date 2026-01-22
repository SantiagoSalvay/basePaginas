import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Headers de seguridad
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('X-Content-Type-Options', 'nosniff')
    requestHeaders.set('X-Frame-Options', 'DENY')
    requestHeaders.set('X-XSS-Protection', '1; mode=block')
    
    return Response.next({
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
    // Proteger todas las rutas excepto las públicas específicas
    '/((?!api/auth|api/products|api/featured-products|api/test|_next/static|_next/image|favicon.ico|public|uploads).*)',
  ],
}