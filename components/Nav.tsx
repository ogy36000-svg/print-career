"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "首页", icon: "⌂" },
  { href: "/companies", label: "企业库", icon: "▦" },
  { href: "/map", label: "地图", icon: "◎" },
  { href: "/growth", label: "成长", icon: "↗" },
  { href: "/profile", label: "我的", icon: "☻" },
];

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="hidden md:block sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white grid place-items-center font-black text-sm">印</span>
            <span className="font-black text-lg tracking-tight">印向未来</span>
          </Link>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  isActive(t.href)
                    ? "bg-ink text-white bg-[#14161a]"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* 移动端底部标签栏 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-black/5 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition-colors ${
                isActive(t.href) ? "text-orange-500" : "text-slate-400"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
