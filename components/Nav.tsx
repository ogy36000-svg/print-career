"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/brand";
const tabs = [
  ["/", "工作台"],
  ["/companies", "企业"],
  ["/roles", "职业方向"],
  ["/industry", "行业"],
  ["/certs", "学习目标"],
  ["/growth", "行动清单"],
  ["/profile", "我的档案"],
];
export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <span className="brand-symbol">景</span>
          <span>
            {brand.name}
            <small>{brand.descriptor}</small>
          </span>
        </Link>
        <nav aria-label="主导航">
          {tabs.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (href === "/" ? pathname === "/" : pathname.startsWith(href))
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
