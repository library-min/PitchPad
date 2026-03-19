// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Profile Images
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Supabase Storage Images
      },
    ],
  },
};

export default nextConfig;
