import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@zerithdb/db": path.join(process.cwd(), "node_modules/zerithdb-db"),
      "@zerithdb/sync": path.join(process.cwd(), "node_modules/zerithdb-sync"),
      "@zerithdb/auth": path.join(process.cwd(), "node_modules/zerithdb-auth"),
      "@zerithdb/network": path.join(process.cwd(), "node_modules/zerithdb-network"),
      "@zerithdb/core": path.join(process.cwd(), "node_modules/zerithdb-core"),
    };
    return config;
  },
};

export default nextConfig;
