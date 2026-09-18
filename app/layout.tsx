import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import OnboardingGuide from "@/components/OnboardingGuide";
import { brand } from "@/lib/brand";
import LetterWidget from "@/components/LetterWidget";
import { CareerProvider } from "@/components/CareerProvider";
import { UserDataProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: `${brand.name} · ${brand.descriptor}`,
  description: "根据你的专业和年级，推荐实习企业、岗位和考证规划",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f7fb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <UserDataProvider>
          <CareerProvider>
            <OnboardingGuide />
            <Nav />
            <LetterWidget />
            <main className="flex-1 pb-24 md:pb-0">{children}</main>
          </CareerProvider>
        </UserDataProvider>
      </body>
    </html>
  );
}
