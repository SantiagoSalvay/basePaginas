/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'localhost', '127.0.0.1'],
  },
  webpack: (config) => {
    // mysql2 necesita estos módulos del lado del servidor
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    
    // Estos módulos solo están disponibles en el lado del servidor de Node.js
    Object.assign(config.resolve.fallback, {
      net: false,
      tls: false,
      fs: false,
      dns: false,
      child_process: false,
      perf_hooks: false,
    });

    return config;
  },
  // Deshabilitar prerenderización estática por completo
  output: 'standalone',
  // Configuraciones experimentales
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  }
};

module.exports = nextConfig;
