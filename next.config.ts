import type { NextConfig } from "next";

const supabaseOrigin = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin : "";
const development = process.env.NODE_ENV !== "production";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${development ? " ws: http:" : ""}${supabaseOrigin ? ` ${supabaseOrigin} wss://${new URL(supabaseOrigin).hostname}` : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // 动态目录与受保护检索需要 Node.js 服务；不能再使用旧的 gh-pages 静态发布脚本。
  images: { unoptimized: true },
  trailingSlash: true,
  async headers() {
    return [{source:"/:path*",headers:[
      {key:"Content-Security-Policy",value:contentSecurityPolicy},
      {key:"X-Content-Type-Options",value:"nosniff"},
      {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
      {key:"X-Frame-Options",value:"DENY"},
      {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
    ]}];
  },
};

export default nextConfig;
