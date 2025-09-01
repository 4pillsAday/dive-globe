import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize Cloudflare context for local dev/preview; safe to not await
void initOpenNextCloudflareForDev();

const mount = process.env.NEXT_PUBLIC_BASE_PATH && process.env.NEXT_PUBLIC_BASE_PATH !== '/' ? process.env.NEXT_PUBLIC_BASE_PATH : '';

const nextConfig: NextConfig = {
  basePath: mount || undefined,
  assetPrefix: mount || undefined,
};

export default nextConfig;
