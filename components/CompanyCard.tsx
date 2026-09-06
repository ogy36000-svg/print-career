"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Company } from "@/lib/types";
import { gradeStyle } from "@/lib/data";
import FavButton from "./FavButton";

export default function CompanyCard({ company, index = 0 }: { company: Company; index?: number }) {
  const g = gradeStyle[company.recommend];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link href={`/companies/${company.id}`} className="block">
        <div className={`card-hover relative bg-white rounded-3xl p-5 ring-1 ring-black/5 overflow-hidden`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-lg tracking-tight">{company.name}</h3>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${g.badge}`}>
                  {company.recommend} · {g.label}
                </span>
                {company.rank2025 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    百强第{company.rank2025}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 truncate">{company.fullName}</p>
            </div>
            <FavButton companyId={company.id} size="sm" />
          </div>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-2">{company.desc}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600">📍 {company.city} · {company.district}</span>
            <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-violet-50 text-violet-600">{company.type}</span>
            {company.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[11px] font-bold px-2 py-1 rounded-lg bg-orange-50 text-orange-600">{t}</span>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-dashed border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400 truncate mr-2">💡 {company.reason}</p>
            <span className="text-xs font-black text-orange-500 whitespace-nowrap">查看 →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
