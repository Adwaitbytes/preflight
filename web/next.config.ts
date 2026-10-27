import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: path.join(__dirname) },
  // Lets the dev server accept HMR from 127.0.0.1 as well as localhost
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
