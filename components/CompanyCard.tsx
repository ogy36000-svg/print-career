"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Company } from "@/lib/types";
import { gradeStyle, companyImage } from "@/lib/data";
import FavButton from "./FavButton";

interface CompanyCardProps {
  company: Company;
  index?: number;
  compact?: boolean;
}

export default function CompanyCard({ company, index = 0, compact = false }: CompanyCardProps) {
  const g = gradeStyle[company.recommend];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4), type: "spring", stiffness: 200, damping: 22 }}
      whileHover={{ y: -6 }}
    >
      <div className="relative overflow-hidden rounded-[1.75rem] bg-white/70 backdrop-blur-xl ring-1 ring-white/60 shadow-lg shadow-slate-200/50 group">
        {/* 背景图头 */}
        <Link href={`/companies/${company.id}`} className="block relative h-32 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={companyImage(company)}
            alt={company.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-lg tracking-tight text-white drop-shadow">{company.name}</h3>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${g.badge} shadow-sm`}>
                  {company.recommend} · {g.label}
                </span>
                {company.rank2025 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/90 text-amber-950">百强第{company.rank2025}</span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-white/70 truncate">{company.fullName}</p>
            </div>
            <div onClick={(e) => e.preventDefault()}>
              <FavButton companyId={company.id} size="sm" />
            </div>
          </div>
        </Link>

        <div className="p-4">
          <p className={`text-sm text-slate-600 leading-relaxed ${compact ? "line-clamp-2" : "line-clamp-3"}`}>{company.desc}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-50/80 text-blue-600 border border-blue-100/50">
              {company.city}{company.district ? ` · ${company.district}` : ""}
            </span>
            <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-violet-50/80 text-violet-600 border border-violet-100/50">
              {company.type}
            </span>
            {company.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[11px] font-bold px-2 py-1 rounded-lg bg-orange-50/80 text-orange-600 border border-orange-100/50">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between gap-2">
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-black text-blue-600 hover:text-blue-800 hover:underline"
              >
                官网 ↗
              </a>
            ) : (
              <span className="text-xs text-slate-300 font-bold">官网未收录</span>
            )}
            <Link href={`/companies/${company.id}`} className="text-xs font-black text-orange-500 whitespace-nowrap hover:translate-x-1 transition-transform">
              查看详情 →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
