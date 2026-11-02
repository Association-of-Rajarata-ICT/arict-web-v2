import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Public content changes rarely; admin mutations invalidate tags immediately (lib/revalidate.ts).
  cacheLife: {
    content: {
      stale: 300, // the browser reuses a page for 5 minutes during client navigation
      revalidate: 3600, // after an hour, the next visit is served from cache and refreshed in the background
      expire: 60 * 60 * 24 * 30, // only block on a fresh render after 30 days without any traffic
    },
    // Values that change once a year (the © year, the default project year).
    year: {
      stale: 3600,
      revalidate: 86400,
      expire: 60 * 60 * 24 * 365,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Optimized images are reused for a week. Cloudinary uploads get unique, never-changing URLs.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    qualities: [60, 75, 85],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Brand assets, icons and the hero photo in /public: reuse for a day, then refresh in the background.
      // (Not "immutable", because these file names don't change when the files do.)
      ...["/brand/:path*", "/images/:path*", "/icon-:size.png", "/icon-maskable-512.png", "/og-default.jpg"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=2592000" }],
      })),
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.arict.lk" }],
        destination: "https://arict.lk/:path*",
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
