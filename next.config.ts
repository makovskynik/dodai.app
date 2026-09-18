import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root,
  },
  async redirects() {
    return [
      {
        source: "/product-of-the-day",
        destination: "/product-of-the-week",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
