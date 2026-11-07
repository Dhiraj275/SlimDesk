import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
