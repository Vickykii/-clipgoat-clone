import { createRequire } from "module";

const require = createRequire(import.meta.url);

const withBundleAnalyzer = (await import("@next/bundle-analyzer").catch(() => ({
  default: () => (config) => config
}))).default({ enabled: process.env.ANALYZE === "true" });

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["https://clipforge.app", process.env.APP_URL].filter(Boolean)
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com"
      }
    ]
  }
};

export default withBundleAnalyzer(nextConfig);
