"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { companies } from "@/lib/data";
import CompanyCard from "@/components/CompanyCard";

const gradeFilters = ["全部", "S", "A", "B", "C"] as const;
const relationFilters = [
  { key: "all", label: "全部" },
  { key: "direct", label: "专业直接相关" },
  { key: "indirect", label: "间接/交叉方向" },
] as const;
const regionFilters = ["全部", "珠三角", "广东省外", "外企", "日资"] as const;

export default function CompaniesPage() {
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState<(typeof gradeFilters)[number]>("全部");
  const [relation, setRelation] = useState<(typeof relationFilters)[number]["key"]>("all");
  const [region, setRegion] = useState<(typeof regionFilters)[number]>("全部");

  const filtered = useMemo(() => {
    return companies
      .filter((c) => {
        if (grade !== "全部" && c.recommend !== grade) return false;
        if (relation !== "all" && c.relation !== relation) return false;
        if (region !== "全部") {
          if (region === "珠三角" && c.province !== "广东") return false;
          if (region === "广东省外" && c.province === "广东") return false;
          if (region === "外企" && !/外企|外资|美资|港资|日资|合资/.test(c.listed + c.tags.join())) return false;
          if (region === "日资" && !/日资|日语/.test(c.listed + c.lang + c.tags.join())) return false;
        }
        if (q.trim()) {
          const s = q.trim().toLowerCase();
          const hay = [c.name, c.fullName, c.type, c.city, c.desc, c.tags.join(), c.jobs.join(), c.reason].join(" ").toLowerCase();
          if (!hay.includes(s)) return false;
        }
        return true;
      })
      .sort((a, b) => a.recommend.localeCompare(b.recommend) || (a.rank2025 ?? 999) - (b.rank2025 ?? 999));
  }, [q, grade, relation, region]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl text-center">
        企业库<span className="text-orange-500">.</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-2 text-center text-slate-500">
        {companies.length} 家精选企业 · 按推荐等级排序 · 点卡片看详情与招聘直达
      </motion.p>

      {/* 搜索框 */}
      <div className="mt-6 max-w-2xl mx-auto relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索企业名 / 岗位 / 关键词，如：日语、烟包、数字印刷…"
          className="w-full px-5 py-4 rounded-2xl glass text-sm md:text-base font-medium outline-none focus:ring-2 focus:ring-orange-400/50 placeholder:text-slate-400"
        />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold hover:text-slate-600">
            清除
          </button>
        )}
      </div>

      {/* 筛选器 */}
      <div className="mt-5 space-y-3 max-w-2xl mx-auto">
        <FilterRow label="等级" items={gradeFilters.map((g) => ({ key: g, label: g === "全部" ? "全部" : `${g} 级` }))} active={grade} onChange={(k) => setGrade(k as typeof grade)} />
        <FilterRow label="关联" items={relationFilters.map((r) => ({ key: r.key, label: r.label }))} active={relation} onChange={(k) => setRelation(k as typeof relation)} />
        <FilterRow label="地区" items={regionFilters.map((c) => ({ key: c, label: c }))} active={region} onChange={(k) => setRegion(k as typeof region)} />
      </div>

      <p className="mt-6 text-center text-xs font-bold text-slate-400">共 {filtered.length} 家</p>

      <div className="mt-6 grid md:grid-cols-2 gap-5">
        {filtered.map((c, i) => (
          <CompanyCard key={c.id} company={c} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center text-slate-400">
          <p className="text-4xl font-black">?</p>
          <p className="mt-3 font-bold">没有匹配的企业，换个关键词或放宽筛选试试</p>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  items,
  active,
  onChange,
}: {
  label: string;
  items: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-black text-slate-400 w-8 shrink-0">{label}</span>
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
              active === it.key
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white/70 text-slate-500 hover:bg-white"
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
