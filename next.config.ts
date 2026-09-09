import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages 项目页路径前缀；本地 dev 不加
  basePath: isProd ? "/print-career" : "",
  assetPrefix: isProd ? "/print-career/" : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
