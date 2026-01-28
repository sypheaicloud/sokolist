import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // ADD THIS SECTION BELOW
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increases the limit from the default 1MB to 10MB
    },
  },
};

export default nextConfig;