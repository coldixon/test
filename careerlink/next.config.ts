import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This app lives in a subdirectory of a repo that has its own lockfile.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
