import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
