import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the `x-powered-by: Next.js` response header — no benefit for a
  // public portfolio and it reveals the stack to scanners.
  poweredByHeader: false,

  images: {
    // Serve WebP and AVIF in addition to the original format.
    // next/image already handles format negotiation via Accept headers;
    // listing both lets Vercel's image API pick the most efficient one.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
