import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    domains:['i.pinimg.com'],
  },
  experimental: {
    // Ensure URL/redirect handling and edge features are stable in prod
    optimizePackageImports: [
      "lucide-react",
    ],
  },
  eslint: {
    // Fail builds on ESLint errors in production to keep quality high
    ignoreDuringBuilds: process.env.NODE_ENV !== "production",
  },

};

export default nextConfig;
