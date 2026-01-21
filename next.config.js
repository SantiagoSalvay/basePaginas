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
  }
}

module.exports = nextConfig
