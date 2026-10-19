import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker で動かすため、必要なファイルだけを .next/standalone にまとめて出力する
  output: "standalone",
  // ネイティブ拡張を含むパッケージはバンドルせず、そのまま読み込む
  serverExternalPackages: ["@node-rs/argon2"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
