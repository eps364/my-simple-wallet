
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Outras configs aqui
  pwa: {
    dest: "public",
    disable: isDev,
    register: true,
    skipWaiting: true,
    // Você pode adicionar mais opções do workbox aqui
  },
};

export default withPWA(nextConfig);
