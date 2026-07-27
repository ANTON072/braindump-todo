import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSTデプロイ時はResource型がまだ生成されていないためスキップ
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
