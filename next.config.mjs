import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.piwisuite.cl",
      },
    ],
  },
};

export default defineCloudflareConfig(nextConfig);