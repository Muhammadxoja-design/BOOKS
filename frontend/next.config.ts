import type { NextConfig } from "next";
import path from "path";

const resolveBackendInternalUrl = () => {
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/$/, "");
  }

  if (process.env.BACKEND_HOSTPORT) {
    const hostPort = process.env.BACKEND_HOSTPORT.replace(/\/$/, "");
    return /^https?:\/\//i.test(hostPort) ? `${hostPort}/api` : `http://${hostPort}/api`;
  }

  return "http://127.0.0.1:5001/api";
};

const backendInternalUrl = resolveBackendInternalUrl();

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    if (!backendInternalUrl) {
      return [];
    }

    return [
      {
        source: "/backend/:path*",
        destination: `${backendInternalUrl}/:path*`,
      },
    ];
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    return config;
  },
};

export default nextConfig;
