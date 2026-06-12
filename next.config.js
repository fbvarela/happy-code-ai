/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default;

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

module.exports = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: { document: "/offline" },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Never cache API or auth — always fresh / session-sensitive
      { urlPattern: /^\/api\//, handler: "NetworkOnly" },
      { urlPattern: /^\/login/, handler: "NetworkOnly" },
      // Content-addressed static assets — cache forever
      {
        urlPattern: /\/_next\/static\//,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: { maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      // Everything else: network-first with short timeout
      {
        urlPattern: /^\//,
        handler: "NetworkFirst",
        options: { cacheName: "pages", networkTimeoutSeconds: 3 },
      },
    ],
  },
})(nextConfig);
