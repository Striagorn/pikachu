import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore: Silence the webpack vs turbopack error on Vercel
  turbopack: {}
};

// next-pwa uses webpack — only wrap in production to avoid Turbopack conflict in dev
if (process.env.NODE_ENV === 'production') {
  const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "trainer-app-cache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60,
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  });
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}
