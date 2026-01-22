/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'tramway.proxy.rlwy.net',
      },
    ],
    unoptimized: true,
  },
  // Configuración optimizada para producción
  experimental: {},
  poweredByHeader: false,
  // Deshabilitar SSG para rutas problemáticas
  exportPathMap: undefined,
  trailingSlash: false,
  // Configuración específica para deployment
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  }
}

module.exports = nextConfig