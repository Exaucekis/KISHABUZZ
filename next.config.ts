import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
