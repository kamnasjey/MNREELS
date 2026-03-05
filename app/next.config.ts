import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  typescript: {
    // Join query types need proper Relationships definitions
    // Will fix when running `supabase gen types`
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
initOpenNextCloudflareForDev();
