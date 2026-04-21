import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker/Cloud Run deployment
  output: "standalone",

  // better-sqlite3 is a native Node.js addon — must not be bundled by webpack
  serverExternalPackages: ["better-sqlite3"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "**.shopify.com" },
    ],
  },
};

export default nextConfig;
