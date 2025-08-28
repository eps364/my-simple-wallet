import type { NextConfig } from "next";
import pwa from "@ducanh2912/next-pwa";

const withPWA = pwa({
  dest: "public",
  register: true,
  workboxOptions: {
    skipWaiting: true
  }
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
