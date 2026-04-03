import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Required for FFmpeg.wasm (SharedArrayBuffer needs cross-origin isolation)
  async headers() {
    return [
      {
        // COOP/COEP зөвхөн upload хуудаст — FFmpeg.wasm SharedArrayBuffer шаардана
        source: "/creator/upload",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      // Static assets — 1 жил cache
      {
        source: "/:path*.(js|css|woff2|woff|ttf|ico|svg|png|jpg|webp)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // HTML pages — 1 цаг cache + stale-while-revalidate
      {
        source: "/((?!api|_next).*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=3600" },
        ],
      },
    ];
  },
};

export default nextConfig;
initOpenNextCloudflareForDev();
