import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        sprint: {
          test: /[\\/]sprint[\\/]/,
          name: 'sprint',
          priority: 10,
        }
      }
    };
    return config;
  },
  
  // transpilePackages: ['@tiptap/core', '@tiptap/react', '@tiptap/starter-kit']
};

export default withBundleAnalyzer(nextConfig);