import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo activamos export si estamos compilando para Tauri
  output: process.env.IS_TAURI === 'true' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
