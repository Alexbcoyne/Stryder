import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@stryder/api', '@stryder/constants', '@stryder/types', '@stryder/utils'],
  typedRoutes: true,
};

export default nextConfig;
