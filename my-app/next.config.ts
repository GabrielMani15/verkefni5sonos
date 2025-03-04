import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors in production builds
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors in production builds (optional)
  },
  reactStrictMode: true, // Ensure React strict mode is enabled
};

export default nextConfig;
