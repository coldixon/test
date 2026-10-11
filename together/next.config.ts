import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No backend yet: the app is a static site over the built-in demo household.
  // `next build` writes plain HTML/JS to ./out that any static host can serve.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
