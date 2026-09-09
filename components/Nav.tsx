"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "首页" },
  { href: "/companies", label: "企业库" },
  { href: "/roles", label: "职业百科" },
  { href: "/industry", label: "趋势" },
  { href: "/certs", label: "考证" },
  { href: "/growth", label: "成长" },
  { href: "/profile", label: "档案" },
];

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mt-4 flex items-center justify-between rounded-full bg-white/60 backdrop-blur-xl ring-1 ring-white/50 shadow-lg shadow-slate-200/30 px-6 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 grid place-items-center font-black text-sm text-white">印</span>
              <span className="font-black text-lg tracking-tight text-slate-800">印向未来</span>
            </Link>
            <nav className="flex items-center gap-1">
              {tabs.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive(t.href)
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* 移动端底部标签栏（可横滑） */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-3 mb-3 rounded-2xl bg-white/70 backdrop-blur-xl ring-1 ring-white/50 shadow-xl shadow-slate-300/30">
          <div className="flex overflow-x-auto no-scrollbar px-1">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`flex-1 min-w-[64px] py-3 text-center text-xs font-black whitespace-nowrap transition-all rounded-xl mx-0.5 ${
                  isActive(t.href)
                    ? "bg-slate-900 text-white"
                    : "text-slate-500"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
