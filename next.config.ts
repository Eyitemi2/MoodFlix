import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },
  // Enable experimental features for better Vercel performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
