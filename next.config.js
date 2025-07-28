/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['localhost', 'tramway.proxy.rlwy.net'],
    unoptimized: true,
  }
}

module.exports = nextConfig
