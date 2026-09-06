"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Company } from "@/lib/types";
import { gradeStyle } from "@/lib/data";
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
      <Link href={`/companies/${company.id}`} className="block group">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-white/70 backdrop-blur-xl ring-1 ring-white/60 shadow-lg shadow-slate-200/50">
          {/* 顶部渐变条 */}
          <div className={`h-1.5 w-full ${g.badge} opacity-90`} />

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-lg tracking-tight text-slate-800 group-hover:text-orange-600 transition-colors">
                    {company.name}
                  </h3>
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${g.badge} shadow-sm`}>
                    {company.recommend} · {g.label}
                  </span>
                  {company.rank2025 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-700">
                      百强第{company.rank2025}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400 truncate">{company.fullName}</p>
              </div>
              <FavButton companyId={company.id} size="sm" />
            </div>

            <p className={`mt-3 text-sm text-slate-600 leading-relaxed ${compact ? "line-clamp-2" : "line-clamp-3"}`}>
              {company.desc}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-50/80 text-blue-600 border border-blue-100/50">
                {company.city} · {company.district}
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

            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
              <p className="text-xs text-slate-400 truncate mr-2 flex-1">{company.reason}</p>
              <span className="text-xs font-black text-orange-500 whitespace-nowrap group-hover:translate-x-1 transition-transform">
                查看详情 →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
