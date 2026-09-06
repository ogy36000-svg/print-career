import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "印向未来 · 数字印刷实习求职导航",
  description: "为广州科技职业技术大学数字印刷专业定制的实习求职网站：企业库、岗位筛选、企业地图、成长中心",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff5a3c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </body>
    </html>
  );
}
