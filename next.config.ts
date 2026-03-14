import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow the homepage to be embedded in a Facebook iframe
        source: '/',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://www.facebook.com https://*.facebook.com" },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        // Allow Supabase storage images
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
